import './style.css';
// import { geoapify } from './secrets';
// import { WebContainer } from '@webcontainer/api';

var latitude;
var longitude;

document.addEventListener('DOMContentLoaded', () => {

    /**
     * input de texto onde coloca o endereço para entrega.
     * @type {HTMLElement}
     */
    var entregaInputElement = document.getElementById("entrega-input");

    /**
     * Pede permissão do cliente para usar o GPS, caso a permissão seja cedida, é retornado
     * Latitude e longitude, caso seja negado, é retornado Error Object (error.code & error.message)
     * 
     * @type {Promise<void>}
     * @returns {Array} [latitude, longitude]
     */
    function gpsRequest() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((pos) => {
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;

                // let message = `(Latitude, Longitude) ${latitude}, ${longitude}`;
                // console.info(message);

                /**
                 * posArray é um array com latitude na posição 0, e longitude na posição 1.
                 * [latitude, longitude]
                 * 
                 * @type {number[]}
                 */
                let posArray = [latitude, longitude];
                return resolve(posArray);
            }, (err) => {
                return reject(err);
            });
        });
    }

    /**
     * Completa o endereço do pedido automaticamente usando latitude e longitude do cliente
     */
    function autocompleteAdress() {
        if (entregaInputElement.value.length >= 10)
            return;

        let pastPlaceholder = entregaInputElement.placeholder;
        entregaInputElement.placeholder = 'Pedindo permissão GPS...';

        gpsRequest().then((pos) => {

            entregaInputElement.placeholder = 'Consultando GPS...';

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

            fetch(`http://localhost:3000/api/geo?lat=${pos[0]}&lon=${pos[1]}`, {method: 'GET'})
            .then(response => response.json()).then(result => {
                    entregaInputElement.placeholder = pastPlaceholder;

                    /**
                     * Endereço formatado
                     */
                    let address = result.features[0].properties.formatted;
                    entregaInputElement.value = address;
                }).catch(error => {
                    console.log('error', error)
                    entregaInputElement.placeholder = pastPlaceholder;
                });

        }, (err) => {
            if (err.code != 1) {
                new Promise(() => {
                    entregaInputElement.placeholder = 'Ocorreu um erro ao consultar o GPS.';
                    entregaInputElement.value = '';
                    setTimeout(() => {
                        entregaInputElement.placeholder = pastPlaceholder;
                    }, 2500);
                    return;
                });
            } else {
                return entregaInputElement.placeholder = pastPlaceholder;
            }
        });
    }
    
    entregaInputElement.addEventListener('click', autocompleteAdress);

    var modal = document.getElementById("modal");
    var mercado_btn = document.getElementById("mercado-btn");

    mercado_btn.addEventListener("click", () => {
        modal.style.display = 'flex';   
    })
    
    window.onclick = function(event) {
        if (event.target == modal) {
          modal.style.display = "none";
        }
      }  
})

