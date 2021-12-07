// JavaScript Document
function save_open (content, filename) {
    document.write("&#209");
    var dlg = false;
		
		document.execCommand('SaveAs', false, filename);
    with(document){
     ir=createElement('iframe');
     ir.id='ifr';
     ir.location='about.blank';
     ir.style.display='none';
     body.appendChild(ir);
      with(getElementById('ifr').contentWindow.document){
           open("text/plain", "replace");
           charset = "utf-8";
           write(content);
           close();
           document.charset = "utf-8";
           dlg = execCommand('SaveAs', false, removeExtFromName(filename)+'.txt');
       }
       body.removeChild(ir);
     }
    return dlg;
}