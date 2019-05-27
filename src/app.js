import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import validator from 'validator';
import axios from 'axios';
import { uniqBy } from 'lodash/fp';
import { watch } from 'melanke-watchjs';
import { renderNewRssFlow, renderNewArticles, renderForm } from './renderers';
import parseRss from './parsers';

const app = () => {
  const state = {
    currentValue: '',
    formStatus: '',
    rssFlows: [],
    articles: [],
  };

  const inputRssElement = document.getElementById('inputRssFlow');
  inputRssElement.addEventListener('input', (e) => {
    e.preventDefault();
    const { target } = e;
    const { value } = target;
    state.currentValue = value;
    state.formStatus = ((validator.isURL(value) && (state.rssFlows.some(rssFlow => rssFlow.url === value) === false)) ? 'valid' : 'invalid');
  });

  const inputRssForm = document.getElementById('form');
  inputRssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (state.formStatus === 'invalid') {
      return;
    }

    const url = `https://cors-anywhere.herokuapp.com/${state.currentValue}`;

    state.formStatus = 'loading';

    axios.get(url).then((response) => {
      const { title, description, articlesForList } = parseRss(response.data);
      state.articles = [...state.articles, ...articlesForList];
      state.rssFlows = [...state.rssFlows, { title, description, url: state.currentValue }];
      state.formStatus = 'loaded';
    }).catch(() => {
      state.formStatus = 'error';
    });
  });

  setInterval(() => {
    const body = document.querySelector('body');
    if (body.classList.contains('modal-open')) {
      return;
    }
    const { rssFlows, articles } = state;
    rssFlows.map((rssFlow) => {
      const url = `https://cors-anywhere.herokuapp.com/${rssFlow.url}`;
      axios.get(url).then((response) => {
        const newArticlesForList = parseRss(response.data).articlesForList;
        state.articles = uniqBy(el => el.link)([...articles, ...newArticlesForList]);
      });
      return rssFlow;
    });
  }, 5000);


  watch(state, 'formStatus', () => renderForm(state));
  watch(state, 'rssFlows', () => renderNewRssFlow(state));
  watch(state, 'articles', () => renderNewArticles(state));
};

export default app;
