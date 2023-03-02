let trEditavel = null

function xmlParaDoc()
{
    let livraria=localStorage.dados;
    if(livraria==undefined)
        livraria="<livraria></livraria>";
    const parser=new DOMParser();
    return parser.parseFromString(livraria,"text/xml");
}

function salvar(xmlDoc)
{
    let serealizador = new XMLSerializer();
    let textoXML=serealizador.serializeToString(xmlDoc);
    localStorage.dados=textoXML;
    //console.log(textoXML)
}

function preencheTabela(xmlDoc)
{
    const raiz=xmlDoc.documentElement;
    const livros=raiz.getElementsByTagName("livro");
    
    let texto="";
    for(let livro of livros)
    {
        texto+=livroParaTd(livro);
    }
    document.querySelector("tbody").innerHTML=texto;
}  

function preencheTabelaFiltradoPorAno(xmlDoc,ano)
{
    const raiz=xmlDoc.documentElement;
    const livros=raiz.getElementsByTagName("livro");
    
    let texto="";
    for(let livro of livros)
    {
        if(livro.getElementsByTagName("ano")[0].firstChild.nodeValue==ano)
            texto+=livroParaTd(livro);
    }
    document.querySelector("tbody").innerHTML=texto;
}  


function livroParaTd(livro)
{
    let titulo=pegaDadoDoLivro("titulo",livro)
    let autor=pegaDadoDoLivro("autor",livro);
    let ano=pegaDadoDoLivro("ano",livro);
    let preco=pegaDadoDoLivro("preco",livro)

    return `<tr>
                <td>${titulo}</td>
                <td>${autor}</td>
                <td>${ano}</td>
                <td>${preco}</td>
                <td><input type='button' onclick='editar(this)' value='Editar'></td>
                <td><input type='button' onclick='deletar(this)' value='Deletar'></td>
            </tr>
            `
    //return "<tr><td>"+titulo+"</td><td>"+autor+"</td>";
}

function limpaCampos(){
    document.getElementById('titulo').value = ''
    document.getElementById('autor').value = ''
    document.getElementById('ano').value = ''
    document.getElementById('preco').value = ''
}

//Função para limpar os campos do Formulário
function editar(botao)
{
    let tr = botao.closest('tr'), tds = tr.getElementsByTagName("td")

    let valueTitulo = tds[0].firstChild.nodeValue
    let valueAutor = tds[1].firstChild.nodeValue
    let valueAno = tds[2].firstChild.nodeValue
    let valuePreco = tds[3].firstChild.nodeValue

    document.getElementById('titulo').value = valueTitulo
    document.getElementById('autor').value = valueAutor
    document.getElementById('ano').value = valueAno
    document.getElementById('preco').value = valuePreco

    trEditavel = tr
}

function deletar(botao)
{
    console.log(botao)
}

const pegaDadoDoLivro= (tag,livro) => {
    let elementos=livro.getElementsByTagName(tag);
    if(tag=="autor" && elementos.length>1)
    {
        let texto="<ul>";
        for(let autor of elementos)
            texto+="<li>"+autor.firstChild.nodeValue+"</li>";
        texto+="</ul>";
        return texto;
    }
    else
        return elementos[0].firstChild?.nodeValue || ''
}

/*function pegaDadoDoLivro(tag,livro)
{
    return livro.getElementsByTagName(tag)[0].firstChild.nodeValue
}*/
function criaElementoNoLivro(tag,texto,nolivro,xmlDoc)
{
    const noElemento=xmlDoc.createElement(tag);
    const noTexto=xmlDoc.createTextNode(texto);
    noElemento.appendChild(noTexto);
    nolivro.appendChild(noElemento);
}

function submit(evento){

    evento.preventDefault();
    //pegar os dados da interface
    const _titulo=document.getElementById("titulo").value
    const _autor=document.getElementById("autor").value
    const _ano=document.getElementById("ano").value 
    const _preco=document.getElementById("preco").value 

    if(!_titulo || !_autor || !_ano || !_preco) return alert('Os campos não podem ser vazios')

    if(trEditavel) editarLinha(_titulo, _autor, _ano, _preco)
    else cadastrar(_titulo, _autor, _ano, _preco)
}


function editarLinha(titulo, autor, ano, preco){
    trEditavel.innerHTML = `<td>${titulo}</td>
    <td>${autor}</td>
    <td>${ano}</td>
    <td>${preco}</td>
    <td><input type='button' onclick='editar(this)' value='Editar'></td>
    <td><input type='button' onclick='deletar(this)' value='Deletar'></td>`

    trEditavel = null

    limpaCampos()

    const xmlDoc=xmlParaDoc();

    salvar(xmlDoc)
}


function cadastrar(titulo, autor, ano, preco)
{
    
    //pegar o documento XML
    const xmlDoc=xmlParaDoc();

    //criar um livro
    const nolivro=xmlDoc.createElement("livro");

    //inserir os dados da interface no livro
    criaElementoNoLivro("titulo",titulo,nolivro,xmlDoc);
    criaElementoNoLivro("autor",autor,nolivro,xmlDoc);
    criaElementoNoLivro("ano",ano,nolivro,xmlDoc);
    criaElementoNoLivro("preco",preco,nolivro,xmlDoc);

    //inserir o livro no documento XML
    xmlDoc.documentElement.appendChild(nolivro);

    //salvar
    salvar(xmlDoc);

    //Redesenha a Tela
    preencheTabela(xmlDoc)

    limpaCampos()
}

function buscarPorTitulo(evento)
{
    evento.preventDefault();
    const textoConsulta=document.getElementById("inputBuscarTitulo").value;
    const xmlDoc=xmlParaDoc();
    const livros=xmlDoc.documentElement.getElementsByTagName("livro");
    for(let livro of livros)
    {
        let noTitulo=livro.getElementsByTagName("titulo")[0];
        let textoTitulo=noTitulo.firstChild.nodeValue;
        if(textoTitulo==textoConsulta)
            alert(livro.getElementsByTagName("preco")[0].firstChild.nodeValue);
    }
}
onload=function(){
    preencheTabela(xmlParaDoc())
    this.document.getElementById("botaoFiltrar").onclick=function(){
        let ano=document.getElementById("filtroAno").value;
        preencheTabelaFiltradoPorAno(xmlParaDoc(),ano);
    }
    document.getElementById("btCadastrar").onclick=submit;
    document.getElementById("btBuscar").addEventListener("click",buscarPorTitulo);
}