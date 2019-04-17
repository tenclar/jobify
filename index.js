const express = require('express')
const app  = express()
const bodyParser = require('body-parser')

const path = require("path")

const sqlite = require('sqlite')
const dbConnection =   sqlite.open(path.resolve(__dirname,'banco.sqlite'),{Promise})
const port = process.env.PORT || 3000
 
app.set('view engine', 'ejs' )
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true}))

app.get('/', async(request, response) =>{
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias')
    
    const vagas = await db.all('select * from vagas')

    const categorias = categoriasDb.map(cat => {
      return{
        ...cat,
        vagas: vagas.filter(vaga => vaga.categoria === cat.id)   
      }
    })

    response.render('home', {
       categorias
   })
})

app.get('/vaga/:id', async(request, response) =>{
    const db  = await dbConnection 
    const vaga = await db.get('select * from vagas where id = ' + request.params.id )
  
    response.render('vaga', {
      vaga
    })
 })

 const init =  async() =>{
    const db = await dbConnection  
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY,  categoria TEXT); ')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY,  categoria INTEGER, titulo TEXT, descricao TEXT); ')
     // const vaga = 'Fullstack Developer (remote)'

      //const descricao = 'Trabalhe como um desenvolvedor full stack na construção de um sistema CRM, resolvendo problemas junto a uma esteira ágil. Análise as necessidades e o ambiente para garantir que a solução que está sendo desenvolvida. Considere a arquitetura e o ambiente operacional atual e as futuras funcionalidades e aprimoramentos. Vivência com desenvolvimento em ambientes e times ágeis, aplicações de alta criticidade e implementação de APIs RESTful. Experiência em NodeJs e Angular 6, HTML, CSS, JavaScript, TypeScript, integração APIs REST, ORM e Git. Desejáveis conhecimentos em Linux e Docker.'
     // await db.run(`insert into vagas(categoria, titulo, descricao) values(1,'${vaga}','${descricao}');`)
    
    //  await db.run(' delete  from vagas where vagas.id = 3' )
    //  await db.run(' UPDATE vagas set vagas.categoria = 2 where vagas.id = 3 ' )
  
    // const categoria = 'Engineering team'
    // const categoria = 'Marketing team'
    // await db.run( ` insert into categorias(categoria) values('${categoria}');`)
 }
 init()


 app.get('/admin', (req, res) =>{
  res.render('admin/home')
})


app.get('/admin/vagas', async(req, res) =>{
  const db = await dbConnection
  const vagas = await db.all('select * from vagas')
  res.render('admin/vagas', {
    vagas
  })
})

app.get('/admin/vaga/excluir/:id', async(req, res) =>{
  const db  = await dbConnection 
  await db.get('delete from vagas where id = ' + req.params.id )
  res.redirect('/admin/vagas')
  
})
app.get('/admin/vaga/:id', async(req, res) =>{
  const db  = await dbConnection 
  const vaga = await db.get('select * from vagas where id = ' + req.params.id )
  const categorias = await db.all('select * from categorias')
  res.render('admin/vaga-editar', {
    vaga, categorias
  })
})
app.get('/admin/vaga', async(req, res) =>{
  const db = await dbConnection
  const categorias = await db.all('select * from categorias')
 
    res.render('admin/vaga',{
      categorias 
    })
})

app.post('/admin/vaga', async(req,res)  => {
     const {categoria,titulo, descricao } = req.body
     const db  = await dbConnection 
     await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria},'${titulo}','${descricao}');`)
    
  res.redirect('/admin/vagas')
})

app.listen(port, (err) => {
    if(err) {
        console.log('Não foi possível iniciar o servidor do Jobify. ' )
    } else {
        console.log("Servidor do Jobify rodando...")
    }
})