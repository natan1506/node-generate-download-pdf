import express from 'express'
import ejs from 'ejs'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from 'fs'
const app = express();

app.use(express.json());
app.use(express.static('public'))


app.get('/pdf-download', async(req, res) => {
  const browser = await puppeteer.launch({headless: true})
  const page = await browser.newPage()
  await page.goto('http://localhost:3333')

  await page.emulateMediaType('print');

  let name = crypto.randomBytes(20).toString('hex');

  const pdf = await page.pdf({
    printBackground: true,
    format: 'Ledger',
    height: '510px',
    width:'746px',
    path: `./${name}.pdf`
  })

  await browser.close()
  res.contentType("application/pdf")
  res.download(`./${name}.pdf`, 'certificate.pdf', (err) =>{
    if (err) {
      console.log(err); // Check error if you want
    }
    fs.unlinkSync(`./${name}.pdf`, function(){
        console.log("File was deleted") // Callback
    });
  
  })
})

app.get('/', (req, res) => {
  const filename = fileURLToPath(import.meta.url)

  let position = () => {
    let p = "bottom-center"
    switch (p) {
      case 'top-left':
        return "top-10 left-10"
      case 'top-center':
        console.log('entrou')
        return "top-10"
      case "top-right":
        return "top-10 right-10"
      case "bottom-left":
        return "bottom-10 left-10"
      case "bottom-center":
        return "bottom-10"
      case "bottom-right":
        return "bottom-10 right-10"
      default:
        return "top-10 left-10"
    }
  }
  
  ejs.renderFile('./template/index.ejs', { 
    name: 'YOUR NAME', 
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident itaque, at consectetur esse tempora, accusamus unde libero assumenda sint beatae soluta maiores laboriosam. Voluptas debitis sapiente excepturi temporibus porro laudantium.', 
    date: new Date().toLocaleDateString(), 
    is_show_logo: false,
    position: position(),
    bg: "background_certificate.jpg"
  }, (err, html) => {
    if(err) {
      console.log(err)
      return res.status(500).json({ message: 'Error in Server' })
    }

    const options = {
      format: 'A4',

    }
    return res.send(html)
  })
})

app.listen(3333)