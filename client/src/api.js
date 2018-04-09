const callApi = async (endpoint, request) => {
  if (request && request.body) {
    request.body = JSON.stringify(request.body);
  }

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  const requestWithHeaders = {
    ...{ headers },
    ...request
  };

  const response = await fetch(endpoint, requestWithHeaders);
  return response.json();
};

const api = {};

api.getMoves = board => (
  callApi('/moves', {
    method: 'POST',
    body: board
  })
);

export default api;
