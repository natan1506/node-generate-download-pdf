import express from 'express'
import ejs from 'ejs'
import path from 'path'
import puppeteer from 'puppeteer'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import fs from 'fs'

const app = express();
app.use(express.json());
app.use(express.static('public'));

const filename = fileURLToPath(import.meta.url)
const __dirname =  path.dirname(filename)

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
  // res.set({
  //   'Cache-Control': 'no-cache',
  //   'Content-Type': 'PDF',
  //   'Content-Length': pdf.file_length,
  //   'Content-Disposition': 'attachment; filename=pdf'
  // });
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
  const __dirname =  path.dirname(filename)
  
  ejs.renderFile('./template/index.ejs', { 
    name: 'YOUR NAME', 
    date: '23/08/2023', 
    is_show_logo:false,
    bg: "background_certificate.jpg"
  }, (err, html) => {
    if(err) {
      console.log(err)
      return res.status(500).json({ message: 'Error in Server' })
    }

    // const options = {
    //   format: 'A4',

    // }
    // pdf.create(html, options).toStream(function(err, stream){
    //   if (err) return res.send(err);
    //   // res.type('pdf');
    //   res.download(stream.path, 'certificate.pdf')

      // res.contentType("application/pdf")
      // res.set({
      //   'Cache-Control': 'no-cache',
      //   'Content-Type': 'PDF',
      //   'Content-Length': stream.file_length,
      //   'Content-Disposition': 'attachment; filename=pdf'
      // });

      // return res.send(`./ola.pdf`)
      // return res.send(html)

    // });

    return res.send(html)
    
  })

  // return res.json({message: 'hello code'})
})

app.listen(3333)