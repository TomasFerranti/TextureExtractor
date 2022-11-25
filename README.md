# Building Texture Extractor

Repository created to store the code made for the project Vistas Situadas do Rio de Janeiro in FGV-RJ, with collaboration between Rice University, ImagineRio and Instituto Moreira Salles.

## Installing the requirements (Windows)

For the .html file to run correctly its needed two things, the installation of Node and threejs. Below follow the links to where you can download and install both.

### Node

Node has a lot of versions. A good practice is to maintain multiple Node versions on your computer through Node Version Manager (NVM). However, its installation is optional and you can use only the basic Node.

- To download and install Node: https://nodejs.org/en/;
- NVM release: https://github.com/coreybutler/nvm-windows/releases/tag/1.1.7;

### JavaScript Packages

The packages used in the project are chosen in a way to make programming easier. Below follows the description of each one of them (currently only threejs):

- Threejs can be downloaded at: https://threejs.org/;

The threejs directory named "three.js-master" must be under "public/packages/".

### Running Node

To run the Node server you can open Windows Prompt through Windows+R and type "cmd". For Linux users this is just Ctrl+Alt+T. Then you can switch folders to the project and run the file through 

    node nodeServer.js

If everything is fine a message will pop up saying "listening at http://localhost:8000". This is the link of the local server where the project is hosted. In case any file is updated, you can just refresh this link to check the changes.

## How does it work?

It is available two documentos for you to understand how to use the tool and what is behind the code. They are:

- All tool functionalities and how to use them are explained in the file "tool_manual.pdf"; 
- For the theory behind it, there is an article available at https://sol.sbc.org.br/index.php/wvc/article/view/18906 which explains all details of formulas and their code implementations.
