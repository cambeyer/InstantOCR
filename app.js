/*global angular*/
angular.module('instantOCRApp', ['ui.bootstrap'])

.controller('uploadController', function($scope) {
	
	$scope.loading = false;

	$scope.fileChanged = function() {
		var input = $("#file");
		input.parents('.input-group').find(':text').val(input.val().replace(/\\/g, '/').replace(/.*\//, ''));
	};

	$scope.uploadFile = function () {
		if (document.getElementById("file").files.length > 0) {
			$scope.loading = true;
			var oData = new FormData();
			oData.append("file", document.getElementById("file").files[0]);
			var oReq = new XMLHttpRequest();
			oReq.open("post", "upload", true);
			oReq.responseType = "text";
			oReq.onreadystatechange = function () {
				if (oReq.readyState == 4 && oReq.status == 200) {
					$scope.$apply(function () {
						try {
							$scope.text = JSON.parse(oReq.response)[0]["textAnnotations"][0]["description"];
						} catch (e) {
							$scope.text = "";
						}
						$scope.loading = false;
						$scope.fileChanged();
					});
				} else if (oReq.readyState == 4 && oReq.status !== 200) {
					$scope.loading = false;
					alert("There was an error uploading your file");
				}
			};
			$("#file").replaceWith($("#file").clone());
			oReq.send(oData);
		}
	};
});