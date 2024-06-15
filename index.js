const http = require('http');
const fs = require('fs');
const uuid=require('uuid')

const getBooks = () => {
    const data = fs.readFileSync('books.json', 'utf8');
    return JSON.parse(data);
};

const saveBooks = (books) => {
    fs.writeFileSync('books.json', JSON.stringify(books, null, 2), 'utf8');
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/books' && req.method === 'GET') {
        const books = getBooks();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(books));
        console.log(books);
    } else if (req.url.match(/\/books\/\d+/) && req.method === 'GET') {
        const id = parseInt(req.url.split('/')[2]);
        const books = getBooks();
        const book = books.find(b => b.id === id);
        if (!book) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book not found' }));
        } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(book));
        }
    } else if (req.url === '/books' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { title, author } = JSON.parse(body);
            const books = getBooks();
            const newBook = {
                id:uuid.v4(),
                title,
                author
            };
            books.push(newBook);
            saveBooks(books);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newBook));
            console.log(newBook);
        });
    } else if (req.url.match(/\/books\/\d+/) && req.method === 'PUT') {
        const id = parseInt(req.url.split('/')[2]);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { title, author } = JSON.parse(body);
            const books = getBooks();
            const index = books.findIndex(b => b.id === id);
            if (index === -1) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Book not found' }));
            } else {
                books[index] = { id, title, author };
                saveBooks(books);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(books[index]));
            }
        });
    } else if (req.url.match(/\/books\/\d+/) && req.method === 'DELETE') {
        const id = parseInt(req.url.split('/')[2]);
        const books = getBooks();
        const newBooks = books.filter(b => b.id !== id);
        if (books.length === newBooks.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book not found' }));
        } else {
            saveBooks(newBooks);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Book deleted' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
