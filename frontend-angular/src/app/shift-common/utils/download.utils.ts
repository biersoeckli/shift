export class DownloadUtils {
    static donwload(data: Uint8Array) {
        const link = document.createElement( 'a' );
        link.style.display = 'none';
        document.body.appendChild( link );
        
        
        const blob = new Blob( [ data ], { type: 'application/pdf' } );	
        const objectURL = URL.createObjectURL( blob );
        link.href = objectURL;
        link.href = URL.createObjectURL( blob );
        link.download =  'file.pdf';
        link.click();
    }
}