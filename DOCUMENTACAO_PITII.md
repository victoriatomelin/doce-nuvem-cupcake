# Projeto Integrador Transdisciplinar II

## Identificação

- **Aluna:** Victória Tomelin Flenik
- **RGM:** 8034321497
- **Projeto:** aplicativo web demonstrativo para uma loja de cupcakes
- **Projeto de origem:** PIT I — levantamento ágil de requisitos para a loja Doce Nuvem

## 1. Objetivo

Construir um MVP web que demonstre o fluxo principal de compra proposto no PIT I: consultar cupcakes disponíveis, buscar e filtrar produtos, montar uma sacola, informar endereço, selecionar uma forma de pagamento demonstrativa e registrar o pedido com atualização de estoque.

## 2. Problema e contexto

O PIT I descreveu uma loja de cupcakes que precisava organizar os requisitos de um aplicativo de vendas após uma experiência anterior de desenvolvimento malsucedida. O backlog identificou clientes e administradores como atores e priorizou catálogo, carrinho, pedido, pagamento, entrega e funções administrativas.

Nesta etapa, a proposta foi transformada em um protótipo executável para demonstrar o fluxo essencial de compra. O sistema roda localmente e não processa pagamentos nem entrega produtos reais.

## 3. Revisão de conceitos

- **Histórias de usuário:** descrição de uma necessidade a partir do papel do usuário, da ação e do benefício esperado.
- **Critérios de aceitação:** condições observáveis para verificar uma funcionalidade, como não ultrapassar o estoque disponível e mostrar o total do pedido.
- **Product Backlog:** lista priorizada de funcionalidades que orienta o desenvolvimento incremental.
- **Experiência do usuário:** busca, filtros, resumo claro da sacola e confirmação antes do registro do pedido.
- **Arquitetura cliente-servidor:** o navegador apresenta a interface e consulta uma API HTTP; o servidor valida e registra os pedidos.
- **Persistência relacional:** SQLite guarda produtos, pedidos e itens de cada pedido em tabelas relacionadas.

## 4. Escopo implementado

| História do PIT I | Situação no MVP | Observação |
|---|---|---|
| #5 — Visualizar vitrine | Implementada | Exibe os produtos com estoque positivo. |
| #6 — Buscar cupcakes | Implementada | Busca por nome, descrição e categoria. |
| #7 — Filtrar categoria | Implementada | Tradicional, vegano e sem glúten. |
| #8 — Ver detalhes | Parcial | O cartão mostra descrição, preço e categoria; ainda não existe uma tela detalhada. |
| #9 — Adicionar à sacola | Implementada | Limita a quantidade ao estoque exibido. |
| #10 — Remover/ajustar itens | Implementada | Permite diminuir, remover e aumentar quantidades. |
| #11 — Visualizar sacola | Implementada | Mostra quantidades, subtotais e total. |
| #12 — Finalizar pedido | Implementada para demonstração | Valida endereço, exibe resumo e registra o pedido no servidor. |
| #13 — Pagar com cartão | Simulada | A opção é registrada no pedido; não há cobrança. |
| #14 — Pagar com PIX | Simulada | A opção é registrada no pedido; não há QR Code nem confirmação bancária. |
| #1–#4 — Cadastro e acesso | Não implementadas | Fora do escopo deste MVP. |
| #15 — Acompanhar entrega | Não implementada | Não há integração com entregador ou notificações. |
| #16 — Avaliar cupcake | Não implementada | Fora do fluxo mínimo demonstrado. |
| #17 — Gerenciar estoque | Parcial | O estoque é iniciado no banco e reduzido no pedido; não há tela administrativa para editar o catálogo. |
| #18 — Visualizar pedidos recebidos | Parcial | A API e a área “Pedidos da loja” listam pedidos; ainda não há filtro por status nem edição de status. |

## 5. Metodologia e procedimento

O desenvolvimento foi organizado em incrementos curtos a partir do backlog do PIT I:

1. Selecionar o fluxo de maior valor para a demonstração: catálogo até confirmação do pedido.
2. Criar a interface responsiva com HTML, CSS e JavaScript.
3. Criar endpoints HTTP para catálogo e pedidos.
4. Definir as tabelas relacionais de produtos, pedidos e itens do pedido.
5. Validar no servidor o endereço, o pagamento escolhido, os produtos e as quantidades.
6. Registrar o pedido e atualizar estoque em uma transação SQLite.
7. Verificar as rotas do catálogo e de pedidos e confirmar a persistência após a solicitação.

## 6. Tecnologias e execução

| Campo solicitado | Informação |
|---|---|
| Linguagem do back-end | JavaScript com Node.js 26 |
| Banco de dados | SQLite (`doce-nuvem.sqlite`) |
| Hospedagem | Execução local para demonstração (`localhost`) |
| Plataforma | Aplicação web acessada pelo navegador |
| Modo de codificação | Tradicional |
| Repositório GitHub | A preencher após publicar o repositório |
| Solução em funcionamento | `http://localhost:3000` durante a execução local |
| Vídeo narrado | A gravar pela aluna |
| Vídeo das modificações | A gravar pela aluna após os testes e ajustes |

O banco e as tabelas são criados automaticamente pelo servidor na primeira execução. Não há bibliotecas externas necessárias. Consulte [README.md](README.md) para o passo a passo.

### Rotas implementadas

- `GET /api/products` — retorna o catálogo e o estoque atual.
- `POST /api/orders` — valida e grava um pedido e seus itens; reduz o estoque dentro de uma transação.
- `GET /api/orders` — retorna os pedidos gravados.

## 7. Verificação técnica e qualidade

Na verificação de integração do MVP:

- O servidor foi validado pelo verificador de sintaxe do Node.js.
- `GET /api/products` retornou os oito itens cadastrados.
- Um pedido demonstrativo foi gravado no SQLite com status “Recebido”.
- A leitura posterior de `GET /api/orders` retornou o pedido e seu item.
- O fluxo pelo navegador chegou à revisão e à confirmação; a interface mostrou “Pedido registrado”.
- O estoque do produto foi decrementado após cada pedido registrado.
- A área “Pedidos da loja” exibiu o pedido persistido.

Esses resultados são verificações técnicas do MVP. Eles não substituem testes com participantes nem as evidências que a disciplina solicitar. A tabela está em [REGISTRO_TESTES.md](REGISTRO_TESTES.md); deve ser preenchida com responsáveis e datas reais. Não declarar participação de colegas que não realizaram os testes.

### Limites conhecidos

- Pagamento e entrega são apenas demonstrativos.
- Não há login, recuperação de senha, edição de estoque, avaliações ou notificações.
- O banco é local e não possui cópia de segurança automática.
- A aplicação ainda não foi publicada em hospedagem pública; o endereço local só funciona no computador que executa o servidor.

## 8. Resultado e próximos incrementos

O MVP demonstra uma compra básica de ponta a ponta com catálogo, filtros, sacola, validação no back-end, persistência SQLite, atualização de estoque e consulta visual de pedidos. Próximos incrementos possíveis são tela detalhada do produto, edição de status e estoque, autenticação, integração de pagamento e implantação em hospedagem pública.

## Referência técnica

Node.js. [Documentação do módulo SQLite](https://nodejs.org/download/release/latest-lithium/docs/api/sqlite.html). O módulo nativo `node:sqlite` está classificado como release candidate na versão consultada.
