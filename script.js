let entry_file = "reference.json";
let final_file = "data3.json";

const processUserData = (data) => {
  const [firstname, lastname] = data.name.trim().split(" ");
  return {
    firstname,
    lastname,
    id: data.id,
  };
};

const getDataUsingXHR = () => {
  // This function returns the processed
  // data using XHR and synchronously, it
  // recursively checks any possible file
  // linked with data location to determine
  // if there is a linked file

  let result = [];

  const _recursive = (file) => {
    // Request to open the file in the data folder
    // and send the request synchronously

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `data/${file}`, false);
    xhr.send();

    if (xhr.status !== 200) return;

    // If it success parse the data
    const data = JSON.parse(xhr.responseText);

    if (data.data) {
      // Process each user data and add it to the
      // overall results list of user data
      const extracted_data = data.data.map((_data) => processUserData(_data));
      result.push(...extracted_data);
    }

    // If another file is linked look in that file
    // too
    if (data.data_location) _recursive(data.data_location);
  };

  // Add the starting file
  _recursive(entry_file);
  // Add the end file
  _recursive(final_file);

  return result;
};

const getDataUsingXHRCallback = (callback) => {
  // This function returns the processed
  // data using XHR and asyncronously using
  // callbacks, it recursively checks any
  // possible file linked with data location
  // to determine if there is a linked file

  let result = [];

  const _recursive = (file, cb) => {
    // Request to open the file using XHR in
    // asynchronous format.
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `data/${file}`, true);

    xhr.onload = () => {
      if (xhr.status !== 200) return;
      // Parse the data, and if its valid we
      // process the data and add it the the results
      // array

      const data = JSON.parse(xhr.responseText);
      if (data.data) {
        const extracted_data = data.data.map((_data) => processUserData(_data));
        result.push(...extracted_data);
      }

      // If we find a data location member
      // we want to search that file, if we
      // dont we want to return the callback
      if (data.data_location) {
        _recursive(data.data_location, cb);
      } else {
        cb();
      }
    };
    xhr.send();
  };

  // Call the function on both the entry and
  // final files
  _recursive(entry_file, () => {
    _recursive(final_file, () => {
      callback(result);
    });
  });
};

const getDataUsingFetchPromise = () => {
  // This function returns the processed
  // data using fetch and promise operations
  // it recursively checks any possible file
  // linked with data location to determine
  // if there is a linked file

  let result = [];

  const _recursiveFetch = (file) => {
    // Fetch the file
    // then: we convert the file to json
    // then: we process the data and append
    // it to the overall results list, and
    // we then cehck if a data location file
    // is linked, if so we repeat the process
    // unitl its no longer linked
    return fetch(`data/${file}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          const extracted_data = data.data.map((_data) =>
            processUserData(_data)
          );
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
