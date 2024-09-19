const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')

const sqlite3 = require('sqlite3').verbose()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(bodyParser.json())

const db = new sqlite3.Database(':memory:', err => {
  if (err) {
    console.error(err.message)
  }
})

db.serialize(() => {
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT,
    role TEXT
  )`, err => {
    if (err) {
      console.error(err.message)
    } else {
      const users = [
        { username: 'admin', password: 'admin', role: 'admin' },
        { username: 'sales', password: 'sales', role: 'sales' },
      ]

      users.forEach(user => {
        bcrypt.hash(user.password, 10, (err, hashedPassword) => {
          if (err) {
            console.error(err.message)
            return
          }
          db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
            [user.username, hashedPassword, user.role],
            function (err) {
              if (err) {
                console.error(err.message)
              } else {
                console.log(`User created: ${user.username}`)
              }
            })
        })
      })
    }
  })

  db.run(`CREATE TABLE sales_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    product TEXT,
    salesAmount REAL,
    date TEXT,
    country TEXT
  )`, err => {
    if (err) {
      console.error(err.message)
    } else {
      const salesEntries = [
        { customerName: 'John Doe', product: 'Laptop', salesAmount: 1200.00, date: '2024-01-01', country: 'USA' },
        { customerName: 'Jane Smith', product: 'Smartphone', salesAmount: 800.00, date: '2024-02-02', country: 'Canada' },
      ]

      salesEntries.forEach(entry => {
        db.run(`INSERT INTO sales_entries (customerName, product, salesAmount, date, country) VALUES (?, ?, ?, ?, ?)`,
          [entry.customerName, entry.product, entry.salesAmount, entry.date, entry.country],
          function (err) {
            if (err) {
              console.error(err.message)
            } else {
              console.log(`Sales entry created: ${entry.customerName} - ${entry.product}`)
            }
          })
      })
    }
  })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message })
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' })
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: err.message })
      }
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' })
      }
      res.json({ status: 'success', role: user.role })
    })
  })
})

app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

app.post('/users', (req, res) => {
  const { username, password, role } = req.body
  db.run(`INSERT INTO users (username, password, role) VALUES (?, ?, ?)`, [username, password, role], function (err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ id: this.lastID, username, password, role })
  })
})

app.put('/users/:id', (req, res) => {
  const { username, password, role } = req.body
  db.run(`UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?`, [username, password, role, req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json({ id: req.params.id, username, password, role })
  })
})

app.delete('/users/:id', (req, res) => {
  db.run(`DELETE FROM users WHERE id = ?`, req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.sendStatus(204)
  })
})

app.get('/sales', (req, res) => {
  db.all('SELECT * FROM sales_entries', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.json(rows)
  })
})

app.post('/sales', (req, res) => {
  const { customerName, product, salesAmount, date, country } = req.body
  db.run(`INSERT INTO sales_entries (customerName, product, salesAmount, date, country) VALUES (?, ?, ?, ?, ?)`,
    [customerName, product, salesAmount, date, country], function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ id: this.lastID, customerName, product, salesAmount, date, country })
    })
})

app.put('/sales/:id', (req, res) => {
  const { customerName, product, salesAmount, date, country } = req.body
  db.run(`UPDATE sales_entries SET customerName = ?, product = ?, salesAmount = ?, date = ?, country = ? WHERE id = ?`,
    [customerName, product, salesAmount, date, country, req.params.id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message })
        return
      }
      res.json({ id: req.params.id, customerName, product, salesAmount, date, country })
    })
})

app.delete('/sales/:id', (req, res) => {
  db.run(`DELETE FROM sales_entries WHERE id = ?`, req.params.id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message })
      return
    }
    res.sendStatus(204)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
