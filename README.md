# ImagineRio

Repositório criado para armazenar o código realizado ao projeto ImagineRio.

## Instalando os requerimentos (Windows)

Para o arquivo .html rodar corretamente são necessárias duas coisas: instalar o Node e os pacotes utilizados no Javascript (numjs e threejs). Com isso, seguem abaixo os links onde você consegue achar esses arquivos.

### Node

O Node possui diversas versões. A utilizada neste projeto é a v10 de 2018 devido à próxima versão não fornecer compatibilidade com o numjs. Com isso, uma boa prática para manter diversas versões do Node no computador chama-se Node Version Manager (NVM). Contanto, a instalação do NVM é opcional e você pode apenas instalar o Node.

- Para adquirir o NVM: https://github.com/coreybutler/nvm-windows/releases/tag/1.1.7;
- Para instalar o node v10: https://nodejs.org/dist/latest-v10.x/win-x64/;

### Pacotes JavaScript

Os pacotes utilizados no projeto foram escolhidos de maneira a facilitar o trabalho. Seguem abaixo as descrições:

- Criar um arquivo Javascript chamado "numjs.js" com o conteúdo de https://cdn.jsdelivr.net/gh/nicolaspanel/numjs@0.15.1/dist/numjs.min.js;
- O threejs pode ser adquirido pela pasta descompactada do zip que se encontra em https://threejs.org/;

Com isso, esse arquivo e essa pasta devem se encontrar dentro do diretório "public/packages", como será mostrado na próxima seção.

### Verificando a instalação

Após os passos acima serem seguidos, você deve possuir a pasta packages semelhante a isso:

<img src="markdown_images/package_files.png">

Com isso, basta agora executar o Node.

### Executando o Node

Após toda a instalação estar correta, basta executar a seguinte linha de código no prompt do Windows (Windows+R digitando cmd)

    node nodeServer.js

caso você se encontre na pasta do projeto. Caso não, você pode navegar até ela usando

    cd "C:\DiretorioDaPasta"

pelo sistema de arquivos do Windows. Com isso, deve-se aparecer uma mensagem no prompt escrita "listening at http://localhost:8000". Este é o link do servidor local onde o projeto está hospedado.
