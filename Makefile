tests_dir := tests
tester := ${tests_dir}/tech-db-forum
report := ${tests_dir}/report.html

docker_name := docker_tp_forum
docker_tag := 1.0
container_name := technoforum


func-test:
	./${tester} func --wait=30 --keep -u http://localhost:5000/api/ -r tests/report.html

func-test-no-keep:
	./${tester} func --wait=50 -u http://localhost:5000/api/ -r tests/report.html

fill-test:
	./${tester} fill --timeout=900

perform-test:
	./${tester} perf --duration=600 --step=60


test_all: func-test-no-keep fill-test perform-test



# --------------------------------------------------------------------------------------------------------------------------------
rebuild:
	docker build --no-cache -t ${docker_name}:${docker_tag} -f Dockerfile ./

docker:
	docker build -t ${docker_name}:${docker_tag} -f Dockerfile ./

daemon:
	docker run --memory 1G --log-opt max-size=1M --log-opt max-file=3 -p 5000:5000 --rm -d -it --name ${container_name} ${docker_name}:${docker_tag}

run:
	docker run --memory 1G --log-opt max-size=1M --log-opt max-file=3 -p 5000:5000 --rm -it --name ${container_name} ${docker_name}:${docker_tag}

inseption:
	docker exec -it ${container_name} bash

stop:
	docker stop ${container_name}

logs:
	docker logs ${container_name}


delete-container:
	docker images
	docker rmi ${docker_name}:${docker_tag}
	docker images
