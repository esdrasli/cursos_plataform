.PHONY: help build up down restart logs clean seed

help: ## Mostra esta ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build das imagens Docker
	docker-compose build

up: ## Iniciar containers (produção)
	docker-compose up -d

up-dev: ## Iniciar containers (desenvolvimento)
	docker-compose -f docker-compose.dev.yml up -d

down: ## Parar containers
	docker-compose down

down-dev: ## Parar containers de desenvolvimento
	docker-compose -f docker-compose.dev.yml down

restart: ## Reiniciar containers
	docker-compose restart

logs: ## Ver logs de todos os serviços
	docker-compose logs -f

logs-backend: ## Ver logs do backend
	docker-compose logs -f backend

logs-frontend: ## Ver logs do frontend
	docker-compose logs -f frontend

logs-db: ## Ver logs do banco de dados
	docker-compose logs -f postgres

seed: ## Executar seed do banco de dados
	docker-compose exec backend npm run seed

clean: ## Parar e remover containers, volumes e imagens
	docker-compose down -v
	docker system prune -f

clean-all: ## Limpar tudo (containers, volumes, imagens, cache)
	docker-compose down -v
	docker system prune -af

ps: ## Ver status dos containers
	docker-compose ps

shell-backend: ## Abrir shell no container do backend
	docker-compose exec backend sh

shell-frontend: ## Abrir shell no container do frontend
	docker-compose exec frontend sh

shell-db: ## Abrir psql no banco de dados
	docker-compose exec postgres psql -U postgres -d cursos_plataform

rebuild: ## Rebuild completo (limpar e reconstruir)
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d

