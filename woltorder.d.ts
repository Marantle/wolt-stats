// This file contains the types for the Wolt order file wold_order_dump.json
export interface WoltOrderFile { orders: WoltOrder[] };

//each order in the file
export interface WoltOrder {
    purchase_id:          string;
    // the date and time the order was received, in the format "dd/mm/yyyy, hh:mm"
    received_at:          string;
    // the status of the order, either delivered, deferred_payment_failed or rejected
    status:               string;
    venue_name:           string;
    // the total amount of the order, in the format "€xx.xx" or "--"
    total_amount:         string
    is_active:            boolean;
    payment_time_ts:      number;
    main_image:           string;
    main_image_blurhash?: string;
    // a csv string of the items in the order, for example "Kurkku Suomi, Pirkka banaani, Pirkka suomalainen kevytmaito 1l, Pirkka suomalainen rasvaton maito 1l, Pirkka esipaistettu yrttivoipatonki 175g pakaste, Pirkka esipaistettu valkosipulivoipatonki 175g pakaste, Snellman maatiaispossun lihasuikale 400g, Juustoportti Hyvin sokeroimaton proteiinivanukas 180g kermatoffee laktoositon, Keiju normaalisuolainen margariini 60% 600g, Vaasan Piimälimppu 400 g maustettu sekaleipä, Nick's proteiinipatukka 50g Caramel chocolate, Paulig Café Los Angel kofeiiniton 260g suodatinjauhettu kahvi RFA, Pirkka Parhaat Green smoothie 250ml, Pakkausmateriaalimaksu and Pringles 185g Cheese-Onion"
    items:                string;
}