"use strict";
(() => {
  // ---------------------------------------------------
  // |------------------- variables --------------------
  // ---------------------------------------------------
  const mainContainer = document.getElementById("mainContainer");
  const currencies = document.getElementById("currencies");
  const liveReports = document.getElementById("liveReports");
  const about = document.getElementById("about");
  const titleMain = document.getElementById("titleMain");
  const search = document.getElementById("search");
  const selectedCards = [];
  const selectedCardsModal = document.getElementById("staticBackdrop");
  const myModal = new bootstrap.Modal(selectedCardsModal);
  // const moreInfoCoin = [];
  const loadingModal = document.getElementById("loadingModal");
  const modalLoad = new bootstrap.Modal(loadingModal);
  const checkboxes = document.getElementsByClassName("toggle-one");
  const titleError = "Welcome To The Dark Side"

  // ---------------------------------------------------
  // |----------- function of the data -----------------
  // ---------------------------------------------------
  async function saveToSessionStorage() {
    const data = await getJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
    const str = JSON.stringify(data);
    sessionStorage.setItem("myArrOfCoin", str);
  }
  async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }
  async function getFromSessionStorageOrHttps() {
    const getData = sessionStorage.getItem("myArrOfCoin");
    if (getData) {
      const dataSession = JSON.parse(getData);
      display(dataSession);
      // console.log("Get From Session");
      return dataSession;
    } else {
      modalLoad.show();
      try {
        const dataJson = await getJson(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1`);
        saveToSessionStorage(dataJson);
        display(dataJson);
        // console.log("Get From Https");
        return dataJson;
      } catch (error) {
        console.error(error);
        mainContainer.innerHTML = `<h1>${titleError}</h1>`;
      } finally {
        modalLoad.hide();
      }
    }
  }

  // ---------------------------------------------------
  // |------ display item be the search input  ---------
  // ---------------------------------------------------
  search.addEventListener("keyup", async () => {
    const arr = await getFromSessionStorageOrHttps();
    const data = search.value.toLowerCase();

    if (!data || data.length === 0) {
      display(arr);
    } else {
      const dataSearch = arr.filter(
        (item) =>
          item.id.toLowerCase().indexOf(data) > -1 ||
          item.symbol.toLowerCase().indexOf(data) > -1
      );

      if (dataSearch.length === 0) {
        mainContainer.innerHTML = `<h1 class="coinNotFound">Coin Not Found</h1>`;
      } else {
        display(dataSearch);
      }
    }
  });

  // ---------------------------------------------------
  // |------ display the item in the container ---------
  // ---------------------------------------------------
  function display(data) {
    const mainContainer = document.getElementById("mainContainer");
    let html = "";
    for (let i = 0; i < data.length; i++) {
      html += `
      <div class="card">
        <div class="card-head">
          <h5 class="card-title">${data[i].symbol}</h5>
          <span class="btn-toggle">
            <input class="toggle-one toggleCheck" type="checkbox" value="${data[i].symbol}" id="check${i}">
            <label class="toggle" for="check${i}"></label>
          </span>
          <hr>
        </div>
        <div class="card-body">
          <img src="${data[i].image}" class="card-img-top" alt="${data[i].id} image">
          <span class="card-text">${data[i].id}</span>
        </div>
        <button id="${data[i].id}" class="moreInfo btn btn-outline-dark" type="button" data-bs-toggle="collapse"
          data-bs-target="#collapseExample${i}" aria-expanded="false" aria-controls="collapseExample${i}">
          More Info
          <div name="spinner" class="spinner-border spinner-border-sm" role="status" style="display: none";></div>
        </button>
        <div>
          <div class="collapse" id="collapseExample${i}">
            <div id="infoCoin${i}" class="card card-body collapse-body"></div>
          </div>
        </div>
      </div>`;
    }
    mainContainer.innerHTML = html;
    // ---------------------------------------------------
    // |-------- listening to all checkboxes -------------
    // ---------------------------------------------------
    $(".toggleCheck").on("click", function () {
      if (this.checked === true) {
        selectedCards.push(this.value);
      }
      if (this.checked === false) {
        let uncheck = this.value;
        const indexUncheck = selectedCards.findIndex((name) => name === uncheck);
        selectedCards.splice(indexUncheck, 1);
      }
      if (selectedCards.length > 5) {
        myModal.show();
      }
      // ---------------------------------------------------
      // |------ push selected cards to the modal ----------
      // ---------------------------------------------------
      const inModal = document.getElementById("inModal");
      let htmlCard = "";
      for (let i = 0; i < selectedCards.length - 1; i++) {
        htmlCard += `
          <div class="card">
              <div class="card-body cardModal">
                ${selectedCards[i]}
                <span class="btn-toggle">
                <input class="toggle-one ee" data-bs-dismiss="modal" type="checkbox" name="modalCheck" value="${selectedCards[i]}" id="checkModal${i}">
                <label class="toggle" for="checkModal${i}"></label>
              </span>
              </div>
            </div>`;
      }
      inModal.innerHTML = htmlCard;
      // ---------------------------------------------------
      // |----- listening to checkboxes in the modal -------
      // ---------------------------------------------------
      const checkboxesModal = document.getElementsByName("modalCheck");
      const checkboxes = document.getElementsByClassName("toggle-one");
      for (const checkModal of checkboxesModal) {
        checkModal.checked = true;
        checkModal.addEventListener("click", function () {
          if (checkModal.checked === false) {
            for (const toDown of checkboxes) {
              if (toDown.value === checkModal.value) {
                toDown.checked = false;
              }
            }
            const indexUncheck = selectedCards.findIndex((name) => name === checkModal.value);
            selectedCards.splice(indexUncheck, 1);
          }
        });
      }
    });
    // ---------------------------------------------------
    // --------------- collapse buttons ------------------
    // ---------------------------------------------------
    const buttonsArr = document.getElementsByClassName("moreInfo");
    for (let i = 0; i < buttonsArr.length; i++) {
      buttonsArr[i].addEventListener("click", async function () {
        if (this.getAttribute("aria-expanded") == "true") {
          const moreInfoCoin = await getMoreInfoFromSessionOrHttps(this);
          const collapse = document.getElementById(`infoCoin${i}`);
          let htmlCol = "";
          for (const item of moreInfoCoin) {
            if (item.name === this.id) {
              htmlCol += `
              USD : ${item.usd} $<br>
              EUR : ${item.eur} €<br>
              ILS : ${item.ils} ₪<br>`;
              collapse.innerHTML = htmlCol;
            }
          }
        }
      });
    }
  }

  // ---------------------------------------------------
  // |----- listening to Escape button the modal -------
  // ---------------------------------------------------
  const modalClose = document.getElementById('modalClose');
  modalClose.addEventListener('click', () => {
    const lastItem = selectedCards[selectedCards.length - 1];
    for (const x of checkboxes) {
      if (x.value === lastItem) {
        x.checked = false;
      }
    }
    const index = selectedCards.findIndex(x => x === lastItem);
    selectedCards.splice(index, 1);
  });

  // ---------------------------------------------------
  // ---- check session more info or do fetch ----------
  // ---------------------------------------------------
  async function getMoreInfoFromSessionOrHttps(element) {
    try {
      const symbol = element.id;
      const spi = element.querySelector('[name="spinner"]');
      const getData = sessionStorage.getItem("CoinInfo");
      const currentTime = Date.now();
      let moreInfoCoin = getData ? JSON.parse(getData) : [];

      const lastUpdatedData = moreInfoCoin.find((item) => item.name === symbol && currentTime - item.timeClick <= 120000);
      if (lastUpdatedData) {
        // If data exists in sessionStorage and less than 10 seconds old, use it.
        return moreInfoCoin;
      }

      // If data doesn't exist in sessionStorage or more than 10 seconds old, fetch from API.
      spi.style.display = "inline-block";
      const dataSymbol = await getJson(`https://api.coingecko.com/api/v3/coins/${symbol}`);
      const info = dataSymbol.market_data.current_price;

      const object = {
        name: element.id,
        usd: info.usd,
        eur: info.eur,
        ils: info.ils,
        timeClick: Date.now(),
        lastUpdated: currentTime,
      };
      // Save the new data to sessionStorage and override the old data for the specific symbol.
      moreInfoCoin = moreInfoCoin.filter((item) => item.name !== symbol);
      moreInfoCoin.push(object);
      sessionStorage.setItem("CoinInfo", JSON.stringify(moreInfoCoin));

      spi.style.display = "none";

      return moreInfoCoin;
    } catch (error) {
      // Handle any errors that may occur during the process and display them in both the console and mainContainer.
      console.error("Error fetching data:", error);
      mainContainer.innerHTML = `<h1>${titleError}</h1>`;
      return [];
    }
  }

  // ---------------------------------------------------
  // ------------ link of the currencies ---------------
  // ---------------------------------------------------
  currencies.addEventListener('click', async () => {
    try {
      const dataCoins = await getFromSessionStorageOrHttps();
      titleMain.innerHTML = "Crypto Currencies";
      display(dataCoins);
      savaTheSelectedCards();
    } catch (error) {
      console.error("Error fetching currency data:", error);
      mainContainer.innerHTML = `<h1>${errorT}}</h1>`;
    }
  });


  // Saves the selection of the buttons when switching between links
  function savaTheSelectedCards() {
    for (const item of selectedCards) {
      for (const card of checkboxes) {
        if (item === card.value) {
          card.checked = true
        }
      }
    }
  }


  about.addEventListener('click', displayAbout)
  // ---------------------------------------------------
  // ------------- link of the about me ----------------
  // ---------------------------------------------------
  function displayAbout() {
    titleMain.innerHTML = `<h1>About Me</h1>`
    mainContainer.innerHTML = `
    <div class="aboutMyDiv">
    <h4 class="titleDivAbout">Hi, everyone ! <br> And Welcome To My Site</h4>
    <div>
      <img class="meImage" src="assats/imges/rubi.png">
      <div>
        <p class="titleDivAbout"><strong> little about me .. </strong></p>
        <p>my name is rubi shamay <br></p>
        <p>
          I am studying John Bryce, fullstack studies, and this is my first project in java script
          I work in Harel Insurance as an analyst</p>
      </div>
    </div>
    <h6 class="titleDivAbout"> about the project ..<br></h6>
    <p>I really hope you enjoyed my coins site..</p>
    <p>The project provides users with information about digital currencies (cryptocurrencies). Users can search for
      specific currencies, view their details, and access additional information, such as current prices in different
      currencies. The interface displays the data in a user-friendly manner and allows users to select and save their
      preferred currencies for easy access. The application employs a spinner modal to indicate loading while fetching
      data from the server, ensuring a smooth user experience.
    </p>
  </div>`
  }
  // ---------------------------------------------------
  // ----------- load currencies in first load ---------
  // ---------------------------------------------------
  window.addEventListener("load", () => { getFromSessionStorageOrHttps(), titleMain.innerHTML = "Crypto Currencies" })


  // ---------------------------------------------------
  // --------------- Chart Function --------------------
  // ---------------------------------------------------

  function createDynamicGraph(elementID, currencies) {
    const chart = new CanvasJS.Chart(elementID, {
      animationEnabled: true,
      title: {
        text: "Cryptocurrency Prices"
      },
      axisX: {
        title: "Time",
        valueFormatString: "HH:mm:ss"
      },
      axisY: {
        title: "Price in USD",
        prefix: "$"
      },
      data: []
    });

    const updateInterval = 2000;
    const dataLength = 20;

    function updateChart(currencies) {
      fetch('https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + currencies.join(',') + '&tsyms=USD')
        .then(response => response.json())
        .then(data => {
          const time = new Date();

          currencies.forEach(currency => {
            const price = data[currency] && data[currency].USD ? data[currency].USD : null;
            if (price !== null && !chart.options.data.some(series => series.name === currency)) {
              chart.options.data.push({
                type: "line",
                xValueType: "dateTime",
                yValueFormatString: "#,##0.## $",
                xValueFormatString: "HH:mm:ss",
                showInLegend: true,
                name: currency,
                dataPoints: []
              });
            }
            if (price !== null) {
              chart.options.data.find(series => series.name === currency).dataPoints.push({ x: time, y: price });
              if (chart.options.data.find(series => series.name === currency).dataPoints.length > dataLength) {
                chart.options.data.find(series => series.name === currency).dataPoints.shift();
              }
            }
          });

          chart.render();
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
    updateChart(currencies);
    setInterval(function () { updateChart(currencies) }, updateInterval);
  }
  function getDataOfSelectedCards(arr) {
    const capitalizedStr = arr.map(item => item.toUpperCase()).join(",");
    return capitalizedStr;
  }
  // ---------------------------------------------------
  // ---------- link of the live reports ---------------
  // ---------------------------------------------------
  liveReports.addEventListener("click", async () => {
    mainContainer.innerHTML = `<div id="chartContainer" style="height: 300px; width: 100%;"></div>`;
    const arr = []
    for (const item of selectedCards) {
      console.log(arr.push(item.toUpperCase()))
      createDynamicGraph("chartContainer", arr);
    }
  });
})()


