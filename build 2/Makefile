.PHONY: build docker-build deploy clean help

help:
	@echo "Comandos disponíveis:"
	@echo "  make build        - Build local dos arquivos"
	@echo "  make docker-build - Build das imagens Docker"
	@echo "  make deploy       - Deploy completo"
	@echo "  make clean        - Limpar builds anteriores"
	@echo "  make help         - Mostrar esta ajuda"

build:
	@./build.sh

docker-build:
	@./docker-build.sh

deploy:
	@./deploy.sh

clean:
	@echo "🧹 Limpando builds anteriores..."
	@rm -rf frontend backend
	@echo "✅ Limpeza concluída!"

