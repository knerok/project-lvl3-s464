import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator'
import axios from 'axios';
import { watch } from 'melanke-watchjs'

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
    state.formStatus = ((validator.isURL(value) && (state.rssFlows.filter(rssFlow => rssFlow.url === state.currentValue).length === 0)) === true) ? 'valid' : 'invalid';
  });
  const submitBotton = document.getElementById('form');
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
      addNewRssFlow(state);
      addNewArticles(state);
      }).catch((error)=> {

        state.formStatus = 'error';
        
      });
  });

  watch(state, 'formStatus', (state) => {

  });
};

generateGreeting();
