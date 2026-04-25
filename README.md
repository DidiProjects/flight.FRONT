Eu quero criar um projeto frontend que implemente a experiência necessária para utilizarmos as funcionalidades descritas no frontend-contract. sobre a arquitetura:

temos o deploy definido, vamos utilizar de apoio pois vamos rodar a pipe no github acrions e fazer o deploy no netlify, podemos atualizar as dependências se necessário.

Nosso projeto vai ser em react, utilizar a versão das dependências mais atuais no mercado.
vamos utilizar MUI como biblioteca de componentes.
Utilizar arquitetura atomic designer para guia de componentes
Criar um thema provider robusto para a aplicação;
quero mapeamento de importações, de forma qye consiga importar minhas dependências com "@atomic-components/molecules/Icon" por exemplo.

Cada componente deve ser definido com pastas primeiro caractere maiúsculas, de forma que o componente esteja dentro de um file index.tsx e os estilos em um style.ts.

Vamos utilziar typescript para essa aplicação

configurar lint

todas as requests estaram em uma pasta services, vamos utilizar classes para prover pra aplicação um contexto enrriquecido com header, captura e tratamento de erros (exibir um toast notification).

Se atentar que essa interface deve persistir autenticação no storage, implementar logout e manter o tocken fresco, de acordo com o período definido por env.

As requests serão utilizando fetch puro mesmo, nada de axios.

testes de unidade vamos utilizar VI test;

Quero uma em paleta clara, e o site no estilo line art + minimalista + animação suave.

Quero boa responsividade e acessibilidade nesse projeto

Quero sustentabilidade nesse projeto, utilizar recursos que são realmente necessário em versões modernas e bem consolidadas no mercado.

código limpo e reutilizável e bem componentizado.