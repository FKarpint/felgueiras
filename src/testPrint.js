const {PosPrinter} = require("@3ksy/electron-pos-printer");

function printSr() {
    console.log("Inside print function");
    const print_data = [
        { type: 'text', value: 'Sample text', style: 'text-align:center;font-weight: bold' },
        { type: 'text', value: 'Another text', style: 'color: #fff' },
    ];

    // returns promise<any>
    PosPrinter.print(print_data, {
        printerName: 'POS-80C',
        preview: false,
        width: '170px',               //  width of content body
        margin: '0 0 0 0',            // margin of content body
        copies: 1,                   // The number of copies to print
    }).then(() => {
            // some code ...
        })
        .catch((error) => {
            console.error(error);
        });
}
printSr();