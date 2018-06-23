CREATE EXTENSION IF NOT EXISTS CITEXT;



-- USERS ----------------------------------------------------------------------------------------------------
CREATE TABLE users
(
  id BIGSERIAL UNIQUE,
  nickname VARCHAR COLLATE ucs_basic PRIMARY KEY,
  about TEXT,
  email CITEXT NOT NULL UNIQUE,
  fullname CITEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueEmail ON users(lower(email));
-- CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueNickname ON users(nickname);
CREATE UNIQUE INDEX IF NOT EXISTS indexSuperStrange ON users(lower(nickname), nickname);
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueNicknameLow ON users(LOWER(nickname collate "ucs_basic"));


-- FORUMS ---------------------------------------------------------------------------------------------------
CREATE TABLE forum
(
  id BIGSERIAL primary key,
  slug CITEXT not null unique,
  title CITEXT,
  author VARCHAR references users(nickname),
  threads INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS indexForumsUser ON forum(lower(author));
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueSlugForums ON forum(lower(slug));


-- THREADS --------------------------------------------------------------------------------------------------
CREATE TABLE threads
(
  id BIGSERIAL PRIMARY KEY,
  slug CITEXT UNIQUE,
  created TIMESTAMP WITH TIME ZONE,
  message TEXT,
  title TEXT,
  author VARCHAR REFERENCES users (nickname),
  forum TEXT,
  votes BIGINT DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS indexThreadsUniqueSlug ON threads(lower(slug));
CREATE INDEX IF NOT EXISTS indexThreadsForum ON threads(lower(forum));
CREATE INDEX IF NOT EXISTS indexThreadsForumCreated ON threads(lower(forum), created);


-- POSTS ----------------------------------------------------------------------------------------------------
CREATE TABLE posts (

  id BIGSERIAL NOT NULL PRIMARY KEY,

  author VARCHAR NOT NULL REFERENCES users(nickname),
  created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp,
  forum VARCHAR,
  isEdited BOOLEAN DEFAULT FALSE,
  message TEXT NOT NULL,
  parent BIGINT DEFAULT 0,
  thread INTEGER NOT NULL REFERENCES threads(id),
  path BIGINT ARRAY
);

CREATE INDEX IF NOT EXISTS indexPostThreadId ON posts(thread, id);
CREATE INDEX IF NOT EXISTS indexPostIdRoot ON posts(id, (path[1]));
CREATE INDEX IF NOT EXISTS indexPostIdPath ON posts(id, path);
CREATE INDEX IF NOT EXISTS indexPostParentThreadRoot ON posts(parent, thread, (path[1]));
CREATE INDEX IF NOT EXISTS indexPostRootThread ON posts(thread, (path[1]));


-- VOTES ----------------------------------------------------------------------------------------------------
CREATE TABLE votes
(
  voice INT CHECK (voice in (1, -1)),
  nickname VARCHAR REFERENCES users (nickname),
  thread BIGINT REFERENCES threads (id),
  
  UNIQUE (nickname, thread)
);

CREATE INDEX IF NOT EXISTS indexVoteThread ON votes(thread);
CREATE INDEX IF NOT EXISTS indexVoteNick ON votes(nickname);
CREATE UNIQUE INDEX IF NOT EXISTS indexVoteNickThread ON votes(lower(nickname), thread);



-- User-Forum relation --------------------------------------------------------------------------------------
CREATE TABLE usersForums (

  author VARCHAR REFERENCES users(nickname) NOT NULL,
  forum CITEXT REFERENCES forum(slug) NOT NULL,

  UNIQUE(forum, author)
);

CREATE UNIQUE INDEX IF NOT EXISTS indexUsersForumsAuthorForum ON usersForums(lower(forum), lower(author));
CREATE INDEX IF NOT EXISTS indexUsersForumsUser ON usersForums (author);
CREATE INDEX IF NOT EXISTS indexUsersForumsUserLow on usersForums (lower(author) COLLATE "ucs_basic");


-- FUNCTIONS & TRIGGERS -------------------------------------------------------------------------------------
CREATE FUNCTION tree_path() RETURNS trigger AS $tree_path$
BEGIN
  new.path := array_append((SELECT path from posts WHERE id = new.parent::BIGINT), new.id);
  RETURN new;
END;
$tree_path$ LANGUAGE plpgsql;


CREATE TRIGGER tree_path_trig BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE tree_path();