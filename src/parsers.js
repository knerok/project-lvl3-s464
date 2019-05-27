const parser = new DOMParser();

export default (data) => {
  const parsedData = parser.parseFromString(data, 'application/xml');
  const title = parsedData.querySelector('title').textContent;
  const description = parsedData.querySelector('description').textContent;
  const articles = [...parsedData.querySelectorAll('item')];
  const articlesForList = articles.map(article => ({
    title: article.querySelector('title').textContent,
    link: article.querySelector('link').textContent,
    description: article.querySelector('description').textContent,
  }));
  return { title, description, articlesForList };
};
