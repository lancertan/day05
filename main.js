//load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const API_KEY = process.env.API_KEY || "";
const NEWSAPI_URL = 'https://newsapi.org/v2/top-headlines'

//port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//create an instance of the application
const app = express()

//configure handlebars
app.engine('hbs', handlebars({ defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')



//routes
app.post('/search',
    express.urlencoded({ extended: true}),
    express.json(),
    async (req, resp) => {
        const search = req.body
        console.info('search: ', search)
        //construct the url
        const url = withQuery(
            NEWSAPI_URL,
            {
                apiKey : API_KEY,
                q : search.newsSearch,
                country : search.country,
                category : search.category
            }
        )

        console.info(`URL: `, url)
        
        const result = await fetch(url)
        const news = await result.json()
        

        /*const rets = []
        for (let d of news) {
                const title = d.title
                const urlToImage = d.urlToImage
                const description = d.description
                const publishedAt = d.publishedAt
                const url = d.url
        }*/

        const rets = news.articles
            .map( d => {
                    return{ title: d.title, urlToImage : d.urlToImage, description: d.description, publishedAt: d.publishedAt, url: d.url}
            }
        )

        console.info(`results: `, rets)

        resp.status(200)
        resp.type('text/html')
        resp.render('result', {
           rets
        })
    }
)


app.get('/', 
    (req, resp) => {
        resp.status(200)
        resp.type('text/html')
        resp.render('index')
    }
)

app.use(express.static(__dirname + '/flags'))
app.use(express.static(__dirname + '/static'))

//start the application
if (API_KEY)
    app.listen(PORT, () => {
        console.info(`Application started on port ${PORT} at ${new Date()}`)
        console.info(`with API KEY: ${API_KEY}`)
    })
else
    console.error('APIR Key is not set')