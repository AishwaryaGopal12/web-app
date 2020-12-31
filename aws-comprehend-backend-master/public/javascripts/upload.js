  var isValid=true;
$('.upload-btn').on('click', function (){
    $('#upload-input').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');

});

$('#upload-input').on('change', function(){
console.log('inside upload'+isValid);
  var files = $(this).get(0).files;
  if (files.length > 0){
    // create a FormData object which will be sent as the data payload in the
    // AJAX request
    var formData = new FormData();
console.log('inside file.length'+isValid);

    // loop through all the selected files and add them to the formData object
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
          console.log('front end file',files,file);
          if(file.type!=='text/plain') {console.log("not applicable");
        isValid=false;}
      // add the files to formData object for the data payload
      formData.append('uploads[]', file, file.name);
    }
if(isValid)
{
    $.ajax({
      url: '/upload',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data){
          console.log('upload successful!\n' + data);
      },
      xhr: function() {
        // create an XMLHttpRequest
        var xhr = new XMLHttpRequest();

        // listen to the 'progress' event
        xhr.upload.addEventListener('progress', function(evt) {

          if (evt.lengthComputable) {
            // calculate the percentage of upload completed
            var percentComplete = evt.loaded / evt.total;
            percentComplete = parseInt(percentComplete * 100);

            // update the Bootstrap progress bar with the new percentage
            $('.progress-bar').text(percentComplete + '%');
            $('.progress-bar').width(percentComplete + '%');

            // once the upload reaches 100%, set the progress bar text to done
            if (percentComplete === 100) {
              $('.progress-bar').html('Done');
                  console.log("Done");
                  var ele=document.getElementById("analytics");
                console.log("element"+ele);
                ele.style.display='block';
                
            }

          }

        }, false);

        return xhr;
      }
    });
}else{
  isValid=true;
  window.alert("Please upload only txt files in utf-8 format.");
}
 }
     this.value = null;

});