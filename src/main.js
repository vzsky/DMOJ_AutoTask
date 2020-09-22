#!/usr/bin/env node

const JSZip = require('jszip')
const fs = require('fs')
const prompts = require('prompts')
const { exec } = require('child_process')

const problem_io = require('./problem_io')
const batch = require('./batch')

const { scp_task_dir, scp_task_statement } = require('./config')
const { resolve } = require('path')

ProblemTypesHandler = {
  io: problem_io,
  batch: batch,
}

const readZip = (zipFile, path, task) => {
  return new Promise((resolve, reject) => {
    var pdf = []
    fs.readFile(zipFile, async function (err, data) {
      if (err) return reject(err)

      var zip = new JSZip()
      await zip.loadAsync(data).then(async function (arr) {
        let files = Object.keys(arr.files)
        files = files.filter((val) => !val.includes('/') && !val.includes('__'))
        pdf = files.filter((val) => val.includes('.pdf'))
        files = files.filter((val) => !val.includes('.pdf'))

        const res = await prompts({
          type: 'select',
          name: 'type',
          message: 'Select problem type',
          choices: [
            { title: 'batch', value: 'batch' },
            { title: 'IO', value: 'io' },
          ],
        })

        await ProblemTypesHandler[res.type](files, path)

        if (pdf.length > 1) {
          return reject(Error('too many pdf'))
        }
        if (pdf.length == 1) {
          zip
            .file(pdf[0])
            .async('nodebuffer')
            .then(function (content) {
              fs.writeFileSync(path + '/' + task + '.pdf', content)
            })
        }
      })

      fs.copyFile(zipFile, path + '/Testcase.zip', (err) => {
        if (err) throw err
      })

      return resolve()
    })
  })
}

const Main = async () => {
  const res = await prompts([
    {
      type: 'text',
      name: 'task',
      message: 'Task ID',
    },
    {
      type: 'text',
      name: 'zipfile',
      message: 'Zip file',
    },
  ])
  if (!res.task || !res.zipfile) return
  let path = '/tmp/dmoj_pusher/' + res.task
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path)
  }
  await readZip(res.zipfile, path, res.task)

  // console.log('scp -r ' + path + ' ' + scp_task_dir)
  // console.log('scp ' + path + '/' + res.task + '.pdf ' + scp_task_statement)

  exec('scp -r ' + path + ' ' + scp_task_dir, (error) => {
    if (error) {
      throw error
    }
    console.log('Successfully sent problem test data to the server.')
  })

  exec(
    'scp ' + path + '/' + res.task + '.pdf ' + scp_task_statement,
    (error) => {
      if (error) {
        throw error
      }
      console.log('Successfully sent problem statement to the server.')
    }
  )
}

Main()
