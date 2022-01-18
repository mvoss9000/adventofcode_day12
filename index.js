const fs = require('fs')

class Node {
    constructor (name) {
        this.name = name
        this.children = new Set()
    }

    toJSON (_k) {
        return Array.from(this.children.values())
    }
}

function create_nodes (lines) {
    let nodes = lines.reduce((m, line) => {
        let [a, b] = line.split('-')

        if (!m[a]) { m[a] = new Node(a) }
        if (!m[b]) { m[b] = new Node(b) }

        if (b !== 'start' && a !== 'end') {
            m[a].children.add(b)
        }
        if (a !== 'start' && b !== 'end') {
            m[b].children.add(a)
        }
        return m
    }, {})

    Object.values(nodes).forEach(n => {
        n.children = Array.from(n.children).sort()
    })
    return nodes
}

function indent(depth) {
    let s = ''
    for (let i=0; i<depth; i++) { s += '  '}
    return s
}

let calls = 1
function _count_paths (nodes, from_child, visited, visit_lim, depth) {
    // console.log(indent(depth), 'find_paths', from_child)
    if (calls % 10000 === 0) {
        console.log('calls', calls)
    }
    calls++
    if (from_child === 'end') {
        return 1
    }
    visited[from_child] = (visited[from_child] || 0) + 1
    if (from_child.toLowerCase() === from_child && visited[from_child] > 1) {
        // only 1 small cave can be visited more than once
        visit_lim = 1
    }

    let count = 0
    for (let child of nodes[from_child].children) {
        let visits = visited[child] || 0
        if (child === child.toUpperCase() || visits < visit_lim) {
            let cpaths = _count_paths(nodes, child, Object.assign({}, visited), visit_lim, depth + 1)
            if (cpaths > 0) {       // only return paths that reach 'end'
                count += cpaths
            }
        }
    }
    // console.log(indent(depth), from_child, '->', count)
    return count
}

function count_paths (file, visit_lim) {
    console.log('part_one:', file)
    let lines = fs.readFileSync(file, 'utf8').split('\n')
    let nodes = create_nodes(lines)
    console.log(JSON.stringify(nodes, null, 2))
    let paths = _count_paths(nodes, 'start', {}, visit_lim, 0)
    console.log(paths)
}


if (require.main === module) {
    count_paths('./data', 2)
    // 233187903
}
