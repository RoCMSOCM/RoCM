function send_to_rocs() {
  var url = window.location.href;
  var galaxy_name = url.split("#")[1].replace("GALAXY=", "");
  var vrot_name = "";
  var vels = [];
  var opac = [];

  $('.velocity path').each(function () {
    vel = $(this).attr('class'); 
    op = +$(this).css('opacity');
    if(op == 1)
      vels.push(vel);
  });

  total_count = vels.length;
  data_count = 0;
  model_count = 0;
  models = [];

  for(var i=0;i<vels.length;i++){
    if(vels[i].contains("DATA"))
      data_count++;
    else{
      model_count++;
      models.push(vels[i]);
    }
  }

  if(data_count == total_count)
  {
    vrot_name = "VROT_DATA"
  }
  else if(model_count == 1){
    vrot_name = models[0];
  } 
  else
  {
    alert('Select only one model to simulate.\nOr\nSelect only the data.\n\n(click the legend)')
    return;
  }

  // localStorage.clear();

  var R = VDATA.R;
  var VROT = VDATA[vrot_name];
  var VROT_DATA = VDATA["VROT_DATA"];

  localStorage.setItem('R', JSON.stringify(R));
  localStorage.setItem('VROT', JSON.stringify(VROT));
  localStorage.setItem('VROT_DATA', JSON.stringify(VROT_DATA));

  vrot_name = vrot_name.replace("VROT_", "");

  localStorage.setItem("vrot_name", vrot_name);
  localStorage.setItem("galaxy_name", galaxy_name);

  localStorage.setItem("STYLE_dictionary", JSON.stringify(STYLE.getDict()));

  localStorage.setItem("PARAMS", JSON.stringify(PARAMS.getDict()));

  var rocs_url = "rocs/index";
  window.location.href = rocs_url;
}