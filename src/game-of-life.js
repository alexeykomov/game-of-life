/*
 * Copyright (c) 2016. Whisp, Alex K.
 */

/**
 * @fileoverview Game of life implementation.
 * @author alexeykcontact@gmail.com (Alex K.)
 */
'use strict';


const CELL_SIZE = {
  width: 6,
  height: 6
};
const DEBUG = false;
const REFRESH_DELAY = 50;
let cont;
let contSize = {
  width: 100,
  height: 100
};
let rafId;

window.addEventListener('unload', onUnload, false);
//window.addEventListener('resize', onResize, false);
window.addEventListener('load', onLoad, false);


function onUnload() {

}

function calcSize(field) {
  const { left, right, top, bottom } = field.getBoundingClientRect();
  return {
    width: right - left,
    height: bottom - top
  };
}

function findField() {
  return document.querySelector('canvas.field');
}

function generateInitialCellState(colCounter, rowCounter) {
  if (Math.random() > .5) {
    return true;
  } else {
    return false;
  }
}

function generateInitialState(matrixSize) {
  const initialState = [];
  for (let colCounter = 0; colCounter < matrixSize.width; colCounter++) {
    initialState[colCounter] = [];
    for (let rowCounter = 0; rowCounter < matrixSize.height; rowCounter++) {
      initialState[colCounter][rowCounter] = generateInitialCellState(colCounter, rowCounter);
    }
  }
  return initialState;
}

function onLoad() {
  const field = findField();
  const fieldSize = calcSize(field.parentNode);
  const matrixSize = {
    width: Math.floor(fieldSize.width / CELL_SIZE.width),
    height: Math.floor(fieldSize.height / CELL_SIZE.height),
  };
  const state = generateInitialState(matrixSize);

  const context = field.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0, 0, matrixSize.width * CELL_SIZE.width,
      matrixSize.height * CELL_SIZE.height);

  rafId = REFRESH_DELAY > 0 ?
      setTimeout(onTick.bind(null, field, state), REFRESH_DELAY) :
      requestAnimationFrame(onTick.bind(null, field, state));
}

function onTick(field, oldState) {
  drawState(field, oldState);

  const newState = produceNewGeneration(oldState);

  rafId = REFRESH_DELAY > 0 ?
      setTimeout(onTick.bind(null, field, newState), REFRESH_DELAY) :
      requestAnimationFrame(onTick.bind(null, field, newState));
}

function produceNewGeneration(oldState) {
  const newState = [];
  for (let colCounter = 0; colCounter < oldState.length; colCounter++){
    newState[colCounter] = [];
    for (let rowCounter = 0; rowCounter < oldState[colCounter].length; rowCounter++) {
      newState[colCounter][rowCounter] = calcNewStateBasedOnNeighbors(oldState, colCounter, rowCounter);
    }
  }
  return newState;
}

function calcNewStateBasedOnNeighbors(state, colCounter, rowCounter) {
  const neighborModifiers =[
      [-1, -1],
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0]
  ];
  const rowsNumber = state[0].length;
  const colsNumber = state.length;
  const cellItselfIsLive = cellIsLive(state[colCounter][rowCounter]);
      // console.log('cellItselfIsLive: ', cellItselfIsLive);
      // console.log('colCounter, rowCounter: ', colCounter, ' ',rowCounter);

  const howManyNeighborsAreLive = neighborModifiers.map(neighborModifier => {
        // console.log('getBoundedIndex(colCounter, neighborModifier[0], colsNumber): ', getBoundedIndex(colCounter, neighborModifier[0], colsNumber));
        // console.log('getBoundedIndex(rowCounter, neighborModifier[1], rowsNumber): ', getBoundedIndex(rowCounter, neighborModifier[1], rowsNumber));
    return state[getBoundedIndex(colCounter, neighborModifier[0], colsNumber)]
        [getBoundedIndex(rowCounter, neighborModifier[1], rowsNumber)]
  }).filter(cell => cellIsLive(cell)).length;

      // console.log('howManyNeighborsAreLive: ', howManyNeighborsAreLive);
  return calcNewStateBasedOnLiveNeighborsNumber(cellItselfIsLive, howManyNeighborsAreLive);
}

function calcNewStateBasedOnLiveNeighborsNumber(cellItselfIsLive, howManyNeighborsAreLive) {
  /*
   Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
   Any live cell with two or three live neighbours lives on to the next generation.
   Any live cell with more than three live neighbours dies, as if by overpopulation.
   Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
   */
  if (cellItselfIsLive) {
    if (howManyNeighborsAreLive < 2) {
      return false;
    }
    if (howManyNeighborsAreLive === 2 || howManyNeighborsAreLive === 3) {
      return true;
    }
    if (howManyNeighborsAreLive > 3) {
      return false;
    }
  } else {
    if (howManyNeighborsAreLive === 3) {
      return true;
    }
  }
  return cellItselfIsLive;
}

function getBoundedIndex(index, indexModifier, arrayLength) {
  const newIndex = index + indexModifier;
  if (newIndex >= arrayLength) {
    return 0;
  }
  if (newIndex < 0) {
    return arrayLength - 1
  }
  return newIndex;
}

function cellIsLive(cell) {
  return cell;
}

function cloneCell(cell) {
  return cell;
}

function drawState(field, state) {
  const context = field.getContext('2d');

  state.forEach((column, colIndex) => {
    column.forEach((row, rowIndex) => {
      if (row) {
        context.fillStyle = 'white';
      } else {
        context.fillStyle = 'black';
      }
      context.fillRect(colIndex * CELL_SIZE.width, rowIndex * CELL_SIZE.height,
          CELL_SIZE.width, CELL_SIZE.height);
      if (DEBUG) {
        context.fillStyle = 'red';
        context.fillText(`${colIndex}, ${rowIndex}`,colIndex * CELL_SIZE.width +
            CELL_SIZE.width / 2,
            rowIndex * CELL_SIZE.height + CELL_SIZE.height / 2);
      }
    })
  });
}