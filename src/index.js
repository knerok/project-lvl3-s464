import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator'
import axios from 'axios';

import { watch } from 'melanke-watchjs'
const generateGreeting = () => {
  const state = {
    currentValue: '',
    formStatus: '',
    rssFlows: [],
    articles: [],
  };

  const inputElement = document.getElementById('inputRssFlow');
  inputElement.addEventListener('input', ({ target }) => {
    const { value } = target;
    state.currentValue = value;
    console.log(value);
    state.formStatus = ((validator.isURL(value) && (state.rssFlows.filter(rssFlow => rssFlow.url === state.currentValue).length === 0)) === true) ? 'valid' : 'invalid';
    console.log(state.formStatus);
  });

  const submitBotton = document.getElementById('submitBotton');
  submitBotton.addEventListener('click', ({ target }) => {
    if (state.formStatus === 'invalid') {
      return;
    }

    const url = `https://cors-anywhere.herokuapp.com/${state.currentValue}`;

    state.formStatus = 'loading';

    axios.get(url).then((response) => {

      const parser = new DOMParser();
      const data = parser.parseFromString(response.data, "application/xml");

      const title = data.querySelector('title').textContent;
      const description = data.querySelector('description').textContent;
      const articles = [...data.querySelectorAll('item')];
      const articlesForList = articles.map(article => ({ title: article.querySelector('title').textContent, link: article.querySelector('link').textContent }));
      state.articles = [...state.articles, ...articlesForList];
      state.rssFlows = [...state.rssFlows, { title, description, url: state.currentValue }];
      state.formStatus = 'loaded';
      }).catch((error)=> {

        state.formStatus = 'error';

      });
  });


  const addNewRssFlow = ({ rssFlows }) => {
    const table = document.getElementById('table');
    let s = '<tr><th>№</th><th>Title</th><th>Description</th></tr>';
    const newRssList = rssFlows.reduce((acc, el, i) => acc + `<tr><td>${i+1}</td><td>${el.title}</td><td>${el.description}</td></tr>`, s);
    table.innerHTML = newRssList;
  };

  const addNewArticles = ({ articles }) => {
    const ul = document.getElementById('list');
    const newTable = articles.reduce((acc, el, i) => acc + `<li class="list-group-item list-group-item-success"><a class="dropdown-item" href="${el.link}">${el.title}<a></li>`, '');
    ul.innerHTML = newTable;
  };

  const renderForm = ({ formStatus }) => {
    const inputElement = document.getElementById('inputRssFlow');
    const submitBotton = document.getElementById('submitBotton');
    const notificationSection = document.querySelector('.notification');
    switch (formStatus) {
      case ('invalid'): {
        notificationSection.innerHTML = '';
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        submitBotton.disabled = true;
        break;
      }
      case ('valid'): {
        notificationSection.innerHTML = '';
        inputElement.classList.remove('is-invalid');
        inputElement.classList.add('is-valid');
        submitBotton.disabled = false;
        break;
      }
      case ('loading'): {
        submitBotton.disabled = true;
        submitBotton.textContent = 'Загрузка...';
        break;
      }
      case ('loaded'): {
        submitBotton.disabled = false;
        submitBotton.textContent = 'Добавить RSS';
        break;
      }
      case ('error'): {
        submitBotton.disabled = true;
        submitBotton.textContent = 'Добавить RSS';
        inputElement.classList.remove('is-valid');
        inputElement.classList.add('is-invalid');
        notificationSection.innerHTML = `<div class="alert alert-warning alert-dismissible fade show my-0" role="alert">
          <strong>Error!</strong> Wrong URL.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span></button></div>`;
        break;
      }
    }
  }


  watch(state, 'formStatus',() => renderForm(state));
  watch(state, 'rssFlows', () => addNewRssFlow(state));
  watch(state, 'articles', () => addNewArticles(state));
};

generateGreeting();
