const express = require('express')
const fs = require('fs')

const app = express()

var config
var projectsFolder

app.use((req, res, next) => {
    console.log('request received: ' + req.path)
    console.log('loading config...')
    loadConfig((err, loadedConfig) => {
        if (err) throw err
        config = loadedConfig
        projectsFolder = config['projects-folder']
        console.log('config loaded')
        next()
    })
})

app.disable('etag')

app.get('/*', express.static('public'))

app.get('/list', (req, res) => {
    console.log('getting list...')
    fs.readdir(projectsFolder, (err, files) => {
        if (err) throw err
        var projects = []
        for (i in files) {
            let filePath = projectsFolder + '/' + files[i]
            let stats = fs.statSync(filePath)
            if (stats.isDirectory()) {
                projects.push(files[i])
            }
        }
        res.send(projects)
    })
})

app.get('/project/:projectName/nextTodo', (req, res) => {
    console.log('getting next todo...')
    getTodoFileForProject(req.params['projectName'], (todoFile) => {
        if (!todoFile) {
            res.send('could not find todo file')
            return
        } else {
            fs.readFile(todoFile, (err, data) => {
                if (err) throw err
                let lines = data.toString().split('\n')
                for (j in lines) {
                    if (lines[j].trim().startsWith('[ ] ')) {
                        console.log('next todo: ' + lines[j].trim())
                        res.send(lines[j].trim())
                        return
                    }
                }
                res.send('no open todo items')
                return
            })
        }
    })
})

function getTodoFileForProject(projectName, cb) {
    fs.readdir(projectsFolder + '/' + projectName, (err, files) => {
        if (err) throw err
        for (i in files) {
            if (files[i].toLowerCase() === 'todo.md') {
                console.log(`found todo file for project ${projectName}: ${files[i]}`)
                cb(projectsFolder + '/' + projectName + '/' + files[i])
                return
            }
        }
        cb(null)
        return
    })
}

function loadConfig(cb) {
    fs.readFile('config.json', (err, data) => {
        cb(err, JSON.parse(data))
    })
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})
