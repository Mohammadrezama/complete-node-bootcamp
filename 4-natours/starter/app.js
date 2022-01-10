const express = require('express');
const res = require('express/lib/response');
const fs = require('fs');
const { dirname } = require('path');
const app = express();
const port = 4000;
app.use(express.json());
const tourFilePath = `${__dirname}/dev-data/data/tours-simple.json`;

const tours = JSON.parse(fs.readFileSync(tourFilePath));
app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server side', app: 'natours' });
});

app.get('/api/v1/tours', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', result: tours.length, data: { tours } });
});

app.get('/api/v1/tours/:id', (req, res) => {
  const { id } = req.params;
  const tour = tours.find((item) => item.id === id * 1);
  if (tour) {
    res.status(200).json({ status: 'success', data: { tour } });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
});

app.patch('/api/v1/tours/:id', (req, res) => {
  const {
    params: { id },
    body,
  } = req;
  let tour = tours.find((item) => item.id === id * 1);
  if (tour) {
    let toursNew = tours.map((item) => {
      if (item.id === id * 1) {
        tour = { ...tour, ...body };
        return tour;
      } else return item;
    });
    console.log({ toursNew, tour });
    fs.writeFile(tourFilePath, JSON.stringify(toursNew), (err) => {
      if (err) {
        res.status(500).json({
          status: 'fail',
          message: 'Internal server error',
        });
        return;
      }
      res.status(200).json({ status: 'success', data: { tour } });
    });
  } else {
    res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  tours.push(newTour);
  fs.writeFile(tourFilePath, JSON.stringify(tours), (err) => {
    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  });
});

app.delete('/api/v1/tours/:id', (req, res) => {
  const { id } = req.params;
  const newTours = tours.filter((item) => item.id !== id * 1);
  if (newTours) {
    fs.writeFile(tourFilePath, JSON.stringify(newTours), (err) => {
      if (err) {
        res
          .status(500)
          .json({ status: 'fail', message: 'Internal server error' });
      } else {
        res.status(200).json({ status: 'success' });
      }
    });

    res.status(204).json({ status: 'success', data: null });
  }
});
app.post('/', (req, res) => {
  res.status(200).send('You can post to this end point');
});
app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});
