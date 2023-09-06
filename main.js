// NÃO IMPORTE CSS PELO MODULE JS, DISALLOWED MIME-TYPE
// import './style.css';

// import { WebContainer } from '@webcontainer/api';

document.addEventListener('DOMContentLoaded', () => {

    /**
     * input de texto onde coloca o endereço para entrega.
     * @type {HTMLElement}
     */
    const entregaInputElement = document.getElementById("entrega-input");

    /**
     * div escrito "Usar minha localização" no modal.
     * @type {HTMLElement}
     */
    const usarLocalModalButton = document.getElementById('div-gps');

    /**
     * input de endereço no modal.
     * @type {HTMLElement}
     */
    const modalInput = document.getElementById('modal-input');

    /**
     * Pede permissão do cliente para usar o GPS, caso a permissão seja cedida, é retornado
     * Latitude e longitude, caso seja negado, é retornado Error Object (error.code & error.message)
     * 
     * @type {Promise<void>}
     * @param {JSON Object} options opções de precisão, timeout, entre outros, para o GPS do navegador.
     * @returns {[int, int]} [latitude, longitude]
     */
    function gpsRequest(options = { enableHighAccuracy: true, timeout: 20000 }) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((pos) => {
                const latitude = pos.coords.latitude;
                const longitude = pos.coords.longitude;

                return resolve([latitude, longitude]);
            }, (err) => {
                return reject(err);
            }, options);
        });
    }

    /**
     * Completa o endereço do pedido automaticamente usando latitude e longitude do cliente
     */
    function autocompleteAdress() {
        if (modalInput.value.length >= 10)
            return;

        const pastPlaceholder = modalInput.placeholder;
        modalInput.placeholder = 'Pedindo permissão GPS...';

        gpsRequest().then((pos) => {

            modalInput.placeholder = 'Consultando GPS...';

            // fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data[0]}&lon=${data[1]}&apiKey=${import.meta.env.VITE_GEOAPIFY_API}`, requestOptions)
            // .then(response => response.json()).then(result => {
            //     entregaInputElement.placeholder = pastPlaceholder;
            //
            //     /**
            //      * Endereço formatado
            //      */
            //     let address = result.features[0].properties.formatted;
            //     entregaInputElement.value = address;
            // }).catch(error => {
            //     console.log('error', error)
            // });

            // NÃO USE O METODO ACIMA PARA UTILIZAR API's !!!!!! USE UMA PROXY
            //
            // ao usar proxys, o client mesmo observando os pacotes que passam pelo frontend
            // do cliente, ele não encontra a API KEY. Usando uma proxy, podemos
            // cuidar das credenciais do lado da proxy.
            //
            // para inicar a proxy localhost, inicie o arquivo proxyapi.js com nodejs.
            // 
            // mande um pacote GET para a proxy (localhost na branch dev) passando latitude e longitude.

            fetch(`http://localhost:443/api/geo?lat=${pos[0]}&lon=${pos[1]}`, {method: 'GET'})
            .then(response => response.json()).then(result => {
                    modalInput.placeholder = pastPlaceholder;

                    /**
                     * Endereço formatado
                     */
                    const properties = result.features[0].properties;
                    const address = `${properties.address_line1}, ${properties.suburb} - ${properties.city}`;
                    console.info(result);
                    modalInput.value = address;
                }).catch(error => {
                    console.log('error', error)
                    modalInput.placeholder = pastPlaceholder;
                });

        }, (err) => {
            if (err.code != 1) {
                new Promise(() => {
                    modalInput.placeholder = 'Ocorreu um erro ao consultar o GPS.';
                    modalInput.value = '';
                    setTimeout(() => {
                        modalInput.placeholder = pastPlaceholder;
                    }, 2500);
                    return;
                });
            } else {
                return modalInput.placeholder = pastPlaceholder;
            }
        });
    }
    
    /**
     * esconde ou mostra o modal.
     * @param {boolean} show
     * @typedef {void}
     */
    function showModal(show = true) {
        if (typeof show != 'boolean') 
            throw new TypeError("argument passed is not a boolean.");
        if (show == undefined || show === null)
            throw new TypeError("argument is null or undefined.");
        
        if (show)
            modal.style.display = 'flex';
        else
            modal.style.display = 'none';
    }

    entregaInputElement.addEventListener('click', () => {
        showModal(true);
        modalInput.click();
        modalInput.focus();
    });
    usarLocalModalButton.addEventListener('click', autocompleteAdress);

    modalInput.addEventListener('keypress', (e) => {
        if (e.key == "Enter") {
            e.preventDefault();
            alert('go to next page :)');
        }
    })

    const modal = document.getElementById("modal");
    const mercado_btn = document.getElementById("mercado-btn");

    showModal(false);
    mercado_btn.addEventListener("click", () => showModal(true))
    
    window.onclick = function(event) {
        if (event.target == modal) {
          showModal(false);
        }
      }
})

