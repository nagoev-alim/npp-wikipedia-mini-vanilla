// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import logo from './assets/images/logo.svg';
import axios from 'axios';
import { showNotification } from './modules/showNotification.js';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='wiki'>
    <img src='${logo}' alt='Wikipedia'>
    <h2>Search Wikipedia</h2>
    <form data-form=''>
      <label>
        <input type='text' name='query' placeholder='Enter something'/>
      </label>
      <button type='submit'>Search</button>
    </form>
    <ul class='results' data-result=''></ul>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      result: document.querySelector('[data-result]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=20&format=json&origin=*&srsearch=',
      }),
    };

    this.DOM.form.addEventListener('submit', this.onSubmit);
  }

  /**
   * @function onSubmit - Form submit handler
   * @param event
   * @returns {Promise<void>}
   */
  onSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const query = Object.fromEntries(new FormData(form).entries()).query.trim();

    if (query.length === 0) {
      showNotification('warning', 'Please enter valid search term.');
      return;
    }

    try {
      form.querySelector('button').textContent = 'Loading...'
      const { data: { query: { search } } } = await this.PROPS.axios.get(`${query}`);

      if (search.length === 0) {
        showNotification('warning', 'No matching results. Please try again.');
        return;
      }
      this.renderData(search);
      form.querySelector('button').textContent = 'Submit'
    } catch (e) {
      showNotification('danger', 'Something went wrong, open dev console.');
      form.querySelector('button').textContent = 'Submit'
      console.log(e);
    }

  };

  /**
   * @function renderData - Render result data HTML
   * @param data
   */
  renderData = (data) => {
    this.DOM.result.innerHTML = `
      ${data.map(({ title, snippet, pageid }) => `
        <li>
          <a href='https://en.wikipedia.org/?curid=${pageid}' target='_blank' >
            <h4>${title}</h4>
            <p>${snippet}<span data-match></span></p>
          </a>
        </li>
      `).join('')}`;
  };
}

// ⚡️Class instance
new App();
