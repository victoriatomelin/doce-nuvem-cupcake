# Doce Nuvem — loja demonstrativa de cupcakes

Projeto acadêmico do Projeto Integrador Transdisciplinar II, baseado nas histórias de usuário do PIT I.

## O que funciona

- Catálogo com nome, descrição, preço, categoria e disponibilidade.
- Busca por sabor e ingrediente e filtro por categoria.
- Sacola com inclusão, remoção e ajuste de quantidade; o conteúdo permanece salvo no navegador.
- Checkout com endereço e escolha de forma de pagamento demonstrativa.
- API que valida estoque e registra pedidos em um banco SQLite local.
- Endpoint de consulta de pedidos para demonstração: `GET /api/orders`.
- Área simples da loja para consultar os pedidos registrados.

## Tecnologias

| Item | Escolha |
|---|---|
| Front-end | HTML, CSS e JavaScript; fonte Host Grotesk via Google Fonts |
| Back-end | Node.js 26, módulo HTTP nativo |
| Banco de dados | SQLite local (`doce-nuvem.sqlite`), criado e preenchido no primeiro uso |
| Plataforma | Aplicação web executada localmente |
| Modo | Codificação tradicional |

## Como executar no Windows

1. Instale Node.js 26 LTS ou superior.
2. Abra o PowerShell nesta pasta do projeto.
3. Execute `node server.js`.
4. Acesse `http://localhost:3000` no navegador.
5. Para parar o servidor, volte ao PowerShell e pressione `Ctrl+C`.

Não é necessário instalar bibliotecas com npm. O banco SQLite é criado automaticamente na primeira execução. Ele guarda o catálogo, os pedidos e os itens de cada pedido. O módulo `node:sqlite` vem no Node.js usado no projeto.

## Rotas da API

- `GET /api/products` — lista o catálogo.
- `POST /api/orders` — valida e registra um pedido.
- `GET /api/orders` — lista os pedidos registrados.

O `POST /api/orders` recebe JSON neste formato:

```json
{
  "address": "Rua Exemplo, 123, Centro",
  "payment": "PIX (simulado)",
  "items": [{ "id": 1, "qty": 2 }]
}
```

## Limites desta demonstração

O checkout não cobra pagamentos nem envia pedidos para uma loja real. Não há cadastro/login, integração com transportadora, edição de status dos pedidos ou hospedagem pública. O SQLite atende à demonstração local; para uso real, ainda seriam necessários autenticação, proteção de dados e integração de pagamento.

## Relação com o PIT I

O MVP cobre principalmente as histórias #5–#14: catálogo, busca, filtros, visualização dos produtos, sacola, finalização e escolha demonstrativa de pagamento. O registro do pedido cria uma base para evoluir as histórias administrativas e de acompanhamento.

## Testes

Os resultados devem ser preenchidos depois de executar a aplicação, registrando quem realizou cada teste e a data real. Use [REGISTRO_TESTES.md](REGISTRO_TESTES.md) como roteiro. Não atribua testes a colegas que não participaram.
