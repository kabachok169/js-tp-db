CREATE EXTENSION IF NOT EXISTS CITEXT;



CREATE TABLE users
(
  id BIGSERIAL UNIQUE,
  nickname VARCHAR COLLATE ucs_basic PRIMARY KEY,
  about TEXT,
  email CITEXT NOT NULL UNIQUE,
  fullname CITEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueEmail ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueNickname ON users(nickname);
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueNicknameLow ON users(LOWER(nickname collate "ucs_basic"));

CREATE TABLE forum
(
  id BIGSERIAL primary key,
  slug CITEXT not null unique,
  title CITEXT,
  author VARCHAR references users(nickname),
  threads INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0
);


CREATE INDEX IF NOT EXISTS indexForumsUser ON forum(author);
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueSlugForums ON forum(slug);

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

-- CREATE INDEX IF NOT EXISTS indexThreadUser ON thread(author);
-- CREATE INDEX IF NOT EXISTS indexThreadForum ON thread(forum);
CREATE UNIQUE INDEX IF NOT EXISTS indexUniqueSlugThread ON threads(slug);

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

-- CREATE INDEX IF NOT EXISTS indexPostAuthor ON messages(author);
-- CREATE INDEX IF NOT EXISTS indexPostForum ON messages(forum);
-- CREATE INDEX IF NOT EXISTS indexPostThread ON messages(thread);
-- CREATE INDEX IF NOT EXISTS indexPostCreated ON messages(created);
-- CREATE INDEX IF NOT EXISTS indexPostPath ON messages((path[1]));
-- CREATE INDEX IF NOT EXISTS indexPostThreadCreateId ON messages(thread, created, id);
-- CREATE INDEX IF NOT EXISTS indexPostParentThreadId ON messages(parent, thread, id);
-- CREATE INDEX IF NOT EXISTS indexPostIdThread ON messages(id, thread);
-- CREATE INDEX IF NOT EXISTS indexPostThreadPath ON messages(thread, path);

CREATE TABLE votes
(
  voice INT CHECK (voice in (1, -1)),
  nickname VARCHAR REFERENCES users (nickname),
  thread BIGINT REFERENCES threads (id),
  
  UNIQUE (nickname, thread)
);

CREATE INDEX IF NOT EXISTS indexVoteThread ON votes(thread);
CREATE INDEX IF NOT EXISTS indexVoteNick ON votes(nickname);

CREATE TABLE usersForums (
  author VARCHAR REFERENCES users(nickname) NOT NULL,
  forum CITEXT REFERENCES forum(slug) NOT NULL,

  UNIQUE(forum, author)
);

CREATE UNIQUE INDEX IF NOT EXISTS indexUsersForumsAuthorForum(lower(forum), lower(author));
CREATE INDEX IF NOT EXISTS indexUsersForumsUser ON usersForums (author);
CREATE INDEX IF NOT EXISTS indexUsersForumsUserLow on usersForums (lower(author) COLLATE "ucs_basic");


CREATE FUNCTION tree_path() RETURNS trigger AS $tree_path$
DECLARE
  pid BIGINT;
BEGIN
  pid := new.parent;
  new.path := array_append((SELECT path from posts WHERE id = pid), new.id);
  RETURN new;
END;
$tree_path$ LANGUAGE plpgsql;


CREATE TRIGGER tree_path_trig BEFORE INSERT OR UPDATE ON posts
FOR EACH ROW EXECUTE PROCEDURE tree_path();