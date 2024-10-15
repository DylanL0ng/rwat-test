let entry_file = "reference.json";
let final_file = "data3.json";

const getDataUsingXHR = () => {
  let result = [];

  const _recursive = (file) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `data/${file}`, false);
    xhr.send();

    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);

      if (data.data) {
        const extracted_data = data.data.map((_data) => {
          const [firstname, lastname] = _data.name.trim().split(" ");
          return {
            firstname,
            lastname,
            id: _data.id,
          };
        });
        result.push(...extracted_data);
      }

      if (data.data_location) _recursive(data.data_location);
    }
  };

  _recursive(entry_file);
  _recursive(final_file);

  return result;
};

const getDataUsingXHRCallback = (callback) => {
  let result = [];

  const _recursive = (file, cb) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `data/${file}`, true);
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        if (data.data) {
          const extracted_data = data.data.map((_data) => {
            const [firstname, lastname] = _data.name.trim().split(" ");
            return {
              firstname,
              lastname,
              id: _data.id,
            };
          });
          result.push(...extracted_data);
        }

        if (data.data_location) {
          _recursive(data.data_location, cb);
        } else {
          cb();
        }
      }
    };
    xhr.send();
  };

  _recursive(entry_file, () => {
    _recursive(final_file, () => {
      callback(result);
    });
  });
};

const getDataUsingFetchPromise = () => {
  let result = [];

  const _recursiveFetch = (file) => {
    return fetch(`data/${file}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          const extracted_data = data.data.map((_data) => {
            const [firstname, lastname] = _data.name.trim().split(" ");
            return {
              firstname,
              lastname,
              id: _data.id,
            };
          });
          result.push(...extracted_data);
        }

        if (data.data_location) {
          return _recursiveFetch(data.data_location);
        } else {
          return result;
        }
      });
  };

  return _recursiveFetch(entry_file).then(() =>
    _recursiveFetch(final_file).then(() => result)
  );
};

const tableBody = document.querySelector("tbody");

const displayUserTableData = (result) => {
  tableBody.innerHTML = "";
  result.forEach(({ firstname, lastname, id, order, file }) => {
    tableBody.innerHTML += `
        <tr>
            <td>
                ${firstname}
            </td>
            <td>
                ${lastname}
            </td>
            <td>
                ${id}
            </td>
        </tr>
    `;
  });
};

document.addEventListener("click", (e) => {
  const element = e.target.closest("button");
  if (!element) return;

  if (element.id === "SYNC--BTN") {
    displayUserTableData(getDataUsingXHR());
  } else if (element.id === "ASYNC--BTN") {
    tableBody.innerHTML = "";
    getDataUsingXHRCallback((result) => displayUserTableData(result));
  } else if (element.id === "PROMISE--BTN") {
    getDataUsingFetchPromise().then((result) => displayUserTableData(result));
  }
});
