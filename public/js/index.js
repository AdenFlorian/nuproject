var projectsArray = []

document.addEventListener('DOMContentLoaded', function () {
    httpGetJson('list', (projects) => {
        addProjectsSync(projects)
        console.log('added ' + projects.length + ' projects!')

        for (i in projectsArray) {
            UpdateNextTodoForProject(i)
        }
    })
})

function UpdateNextTodoForProject(projectId) {
    getNextTodoForProject(projectsArray[projectId], (todo) => {
        console.log('got todo for project ' + projectId)
        let projectRow = document.getElementById('project-row-' + projectId)
        let newTableData = document.createElement('td')
        let newTextNode = document.createTextNode(todo)
        newTableData.appendChild(newTextNode)
        projectRow.appendChild(newTableData)
    })
}

function httpGetJson(path, cb) {
    httpGet(path, cb, true)
}

function httpGetString(path, cb) {
    httpGet(path, cb, false)
}

function httpGet(path, cb, isResponseJson) {
    const httpRequest = new XMLHttpRequest()

    if (!httpRequest) {
        throw 'failed to create a new XMLHttpRequest :('
    }

    httpRequest.onreadystatechange = () => {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                if (isResponseJson) {
                    cb(JSON.parse(httpRequest.responseText))
                } else {
                    cb(httpRequest.responseText)
                }
            } else {
                throw 'Didn\'t get a 200 back :('
            }
        }
    }

    httpRequest.open('GET', path)
    httpRequest.send()
}

function addProjectsSync(newProjects) {
    for (i in newProjects) {
        addProjectSync(newProjects[i])
    }
}

function addProjectSync(newProject) {
    let newTableRow = document.createElement("tr")
    let projectId = projectsArray.push(newProject) - 1
    newTableRow.id = 'project-row-' + projectId
    let newTableData = document.createElement("td")
    let newTextNode = document.createTextNode(newProject)
    newTableData.appendChild(newTextNode)
    newTableRow.appendChild(newTableData)
    let projectsTable = document.getElementById('projects-table')
    projectsTable.appendChild(newTableRow)
}

function getNextTodoForProject(projectName, cb) {
    httpGetString('project/' + projectName + '/nextTodo', (todo) => {
        cb(todo)
    })
}