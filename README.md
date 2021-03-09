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

<img src="markdown_images/packages_files.png">

Com isso, basta agora executar o Node.

### Executando o Node

Após toda a instalação estar correta, basta executar a seguinte linha de código no prompt do Windows (Windows+R digitando cmd)

    node nodeServer.js

caso você se encontre na pasta do projeto. Caso não, você pode navegar até ela usando

    cd "C:\DiretorioDaPasta"

pelo sistema de arquivos do Windows. Com isso, deve-se aparecer uma mensagem no prompt escrita "listening at http://localhost:8000". Este é o link do servidor local onde o projeto está hospedado. Caso você atualize algum arquivo, para reiniciar o servidor basta cancelar o atual usando CTRL+C e executar o Node novamente.

## Como funciona?

Essa seção se dedica à explicar os funcionamentos desenvolvidos até agora.

### Calibração

Após carregar uma imagem Web ou local (nome completo e salva na pasta images), deve-se calibrar os parâmetros da câmera escolhendo para cada eixo dois pares de segmentos de reta apropriados. Depois disso, clicar em calcular.

Você também pode salvar essa calibração juntamente com a imagem para carregá-las depois, através de salvar calibração e carregar calibração (ficarão salvas na pasta calib).

Atualmente se encontram duas calibrações como exemplo, "cabex1" e "cabex2".

### Extração

Trabalho em andamento, atualmente se pode extrair as texturas da seguinte maneira: primeiro se escolhe o plano paralelo e clica-se no botão extrair. Depois disso, selecione três pontos no canvas da imagem: dois no mesmo eixo e um para "extensão". Com isso, este será criado no ambiente 3D que ainda está com uma configuração não adequada de câmera.

Assim, para criar outros planos você deve selecionar novamente o novo plano paralelo e clicar no segmento de reta de onde deseja extender, e depois o ponto de extensão. Este também será adicionado à cena 3D.
