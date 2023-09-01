import './style.css';
import { geoapify } from './secrets';
import { WebContainer } from '@webcontainer/api';


var latitude;
var longitude;

document.addEventListener('DOMContentLoaded', () => {

    /**
     * input de texto onde coloca o endereço para entrega.
     * @typedef {HTMLElement}
     */
    var entregaInputElement = document.getElementById("entrega-input");

    /**
     * Pede permissão do cliente para usar o GPS, caso a permissão seja cedida, é retornado
     * Latitude e longitude, caso seja negado, é retornado Error Object (error.code & error.message)
     * 
     * @async
     * @returns {Array} [latitude, longitude]
     */
    function gpsRequest() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition((pos) => {
                latitude = pos.coords.latitude;
                longitude = pos.coords.longitude;
                let message = `(Latitude, Longitude) ${latitude}, ${longitude}`;
        
                console.info(message);
                /**
                 * data é um array com latitude na posição 0, e longitude na posição 1.
                 * [latitude, longitude]
                 * 
                 * @typedef {number}
                 */
                let data = [latitude, longitude];
                return resolve(data);
            }, (err) => {
                return reject(err);
            });
        });
    }

    /**
     * Completa o endereço do pedido automaticamente usando latitude e longitude do cliente
     * @fires fetch(API);
     */
    function autocompleteAdress() {
        if (entregaInputElement.value.length >= 10)
            return;

        let pastPlaceholder = entregaInputElement.placeholder;
        entregaInputElement.placeholder = 'Consultando GPS...';
        gpsRequest().then((data) => {
            var requestOptions = {
                method: 'GET',
            };
            
            // Pra mais informações sobre o resultado da API,
            // visite https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding
            fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${data[0]}&lon=${data[1]}&apiKey=${geoapify.api}`, requestOptions)
            .then(response => response.json()).then(result => {
                entregaInputElement.placeholder = pastPlaceholder;

                /**
                 * Endereço formatado
                 */
                let address = result.features[0].properties.formatted;
                entregaInputElement.value = address;
            }).catch(error => {
                console.log('error', error)
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
})