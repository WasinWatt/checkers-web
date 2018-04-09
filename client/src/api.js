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

api.getMoves = body => (
  callApi('/moves', {
    method: 'POST',
    body
  })
);

api.makeMove = body => (
  callApi('/step', {
    method: 'POST',
    body
  })
);

api.moveAI = body => (
  callApi('/ai', {
    method: 'POST',
    body
  })
);

export default api;
