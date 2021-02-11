/*
keysearchPlaces() 를 만들어야합!!!
GPS 안쓰게 토글도 만들어야지 

지도 레벨이 일정 수준을 넘어가면 모든 오버레이는 숨김
*/



/*
<div class="button" style="position:absolute; margin-top:0px;margin-left: 5%;">
    <button onclick="getInfo()">GET_INFO</button>
    <button onclick="gps_tracking()">현재 위치로</button>
</div>

*/


var mapContainer = document.getElementById('map_id'), // 지도를 표시할 div 
    mapOption = { 
        center: new kakao.maps.LatLng(37.2804721840256, 127.11467724252604),
        level: 4 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

/*
// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
var mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
    
// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
*/




var gps_use = null; //gps의 사용가능 여부
var gps_lat = null; // 위도
var gps_lng = null; // 경도
var gps_position; // gps 위치 객체

gps_check();
// gps가 이용가능한지 체크하는 함수이며, 이용가능하다면 show location 함수를 불러온다.
// 만약 작동되지 않는다면 경고창을 띄우고, 에러가 있다면 errorHandler 함수를 불러온다.
// timeout을 통해 시간제한을 둔다.
function gps_check(){
    if (navigator.geolocation) {
        var options = {timeout:5000, enableHighAccuracy: true};
        navigator.geolocation.getCurrentPosition(showLocation, errorHandler, options);
        console.log(gps_lat,gps_lng)
    } else {
        alert("GPS_추적이 불가합니다.");
        gps_use = false;
    }
}


// gps 이용 가능 시, 위도와 경도를 반환하는 showlocation함수.
function showLocation(position) {
    gps_use = true;
    gps_lat = position.coords.latitude;
    gps_lng = position.coords.longitude;
}


// error발생 시 에러의 종류를 알려주는 함수.
function errorHandler(error) {
    if(error.code == 1) {
        console.log("permission denied");
    } else if( err.code == 2) {
        console.log("position unavailable (error response from location provider)");
    } else if( err.code == 3) {
        console.log("timeout");
    } else if( err.code == 0) {
        console.log("unknown error");
    }
    gps_use = false;
}

function onClickGPS() {
    gps_check()
    changeCategoryClass(this)
    if (gps_use) {
        map.panTo(new kakao.maps.LatLng(gps_lat,gps_lng))
        var gps_content = '<div><img class="pulse" draggable="false" unselectable="on" src="https://ssl.pstatic.net/static/maps/m/pin_rd.png" alt=""></div>';
        var currentOverlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(gps_lat,gps_lng),
            content: gps_content,
        })
        currentOverlay.setMap(map)
    } else {
        alert("접근차단하신 경우 새로고침, 아닌 경우 잠시만 기다려주세요.")
        gps_check()
    }
}

addCategoryClickEvent()

function addCategoryClickEvent() {
    var category = document.getElementById('category'),
        children = category.children
    
    /*
    // category의 하위 항목에 onclick 함수를 할당해줌
    for (var i=0; i<children.length-1; i++) {
        children[i].onclick = onClickCategory
    }
    */
    children[0].onclick = getInfo

    // gps(나의 위치 찾기)만 따로 함수를 만들어줘서 관리
    children[children.length-1].onclick = onClickGPS
}

// 카테고리를 클릭했을 때 호출되는 함수입니다
function onClickCategory() {
    var id = this.id,
        className = this.className

    // category 하위 항목을 선택하면 palce overlay가 꺼짐
    placeOverlay.setMap(null)

    // 현재 켜져있는 상태였던 걸 한번 더 클릭한 거면 꺼주고, 꺼진 상태였으면 활성화.
    if (className === 'on') {
        currCategory = ''
        changeCategoryClass()
        removeMarker()
    } else {
        currCategory = id
        changeCategoryClass(this)
        searchPlaces()
    }
}

// 클릭된 카테고리에만 클릭된 스타일을 적용하는 함수입니다
function changeCategoryClass(el) {
    var category = document.getElementById('category'),
        children = category.children
    // 다른 카테고리 하위 목록들은 다 꺼주고
    for (var i=0; i<children.length; i++ ) { 
        children[i].className = ''
    }
    // 현재 선택된 카테고리만 활성화 해 줍니다.
    if (el) {
        el.className = 'on'
    } 
}
/* 여기까지 GPS 관련 함수,,,,,,,, 추후에 정리 필요 */


function keysearchPlaces() {
    currCategory = 'keyword'
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!')
        return false
    }
    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    // ps.keywordSearch(keyword, placesSearchCB)
}


/* ---------- DEBUGing용 함수 ---------- */
function getInfo() {
    var center = map.getCenter(); 
    var level = map.getLevel();
    var mapTypeId = map.getMapTypeId();
    var bounds = map.getBounds();
    var swLatLng = bounds.getSouthWest();
    var neLatLng = bounds.getNorthEast();
    var boundsStr = bounds.toString();
    
    var message = '지도 중심좌표는 위도 ' + center.getLat() + ',\n';
    message += '경도 ' + center.getLng() + ' 이고\n';
    message += '지도 레벨은 ' + level + ' 입니다 \n\n';
    message += '지도 타입은 ' + mapTypeId + ' 이고\n ';
    message += '지도의 남서쪽 좌표는 ' + swLatLng.getLat() + ', ' + swLatLng.getLng() + ' 이고 \n';
    message += '북동쪽 좌표는 ' + neLatLng.getLat() + ', ' + neLatLng.getLng() + ' 입니다';
    console.log(message)
}


kakao.maps.event.addListener(map, 'click', function(mouseEvent) {        
    
    // 클릭한 위도, 경도 정보를 가져옵니다 
    var latlng = mouseEvent.latLng;
    
    var message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
    message += '경도는 ' + latlng.getLng() + ' 입니다';
    
    console.log(message)
});
/* ---------- DEBUGing용 함수 ---------- */




/* ---------- Marker Cluster용 함수 ---------- */ 
// 마커 클러스터러를 생성합니다
var clusterer = new kakao.maps.MarkerClusterer({
    map: map,
    averageCenter: true,
    minLevel: 4,
    disableClickZoom: true
});

// 마커 클러스터러 클릭이벤트
kakao.maps.event.addListener(clusterer, 'clusterclick', function(cluster) {
    var level = map.getLevel()-2;
    // 지도를 클릭된 클러스터의 마커의 위치를 기준으로 확대합니다
    map.setLevel(level, {anchor: cluster.getCenter()});
    var cluster_center = new kakao.maps.LatLng(cluster.getCenter().Ma, cluster.getCenter().La);
    map.setCenter(cluster_center);
});



var store_data;
var cluster_markers = [];
var overlay_set = [];
var marker_onoff = Array.from({length: 100}, () => 0);

data_path = "/HotPlace_data/giheung-1km.json"
// HotPlace 데이터 로드
loadJSON(data_path,function(data) {
    store_data=data;
    make_cluster_marker(data);
    }, function(xhr) {console.error(xhr)}
);


function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

function make_cluster_marker(data) {
    for (i in data) {
        cluster_markers[i] = new kakao.maps.Marker({
            position : new kakao.maps.LatLng(data[i].lat, data[i].lng),
            title : data[i].name
        });
        
        (function (i,data){make_overlay(i,data)})(i,data[i]);
        (function (i,marker,overlay) {
            kakao.maps.event.addListener(marker, 'click', function() {
                if (marker_onoff[i]==0){overlay.setMap(map); marker_onoff[i]=1;}
                else if (marker_onoff[i]==1){overlay.setMap(null); marker_onoff[i]=0;}
                });
        })(i,cluster_markers[i], overlay_set[i]);
        
    };
    clusterer.addMarkers(cluster_markers);
}

function make_overlay(i,data) {
    
    var overlay = new kakao.maps.CustomOverlay({zIndex:1, xAnchor:0.5, yAnchor:1.3});
    
    var content = '<div class="overlay_info">';
        content += '    <a href="#"> <strong>'+ data.name + '</strong><div class="close" onclick="close_overlay('+i+')" title="닫기"></div></a>';
        content += '    <div class="desc">';
        content += '        <span class="address">  ☆ (평가) : '+ data.star + '점 (' + data.reply + '명) <br>';
        content += data.review + '명 리뷰' +'</span>';
        content += '    </div>';
        content += '</div>';
    
    overlay.setContent(content);
    overlay.setPosition(new kakao.maps.LatLng(data.lat, data.lng));
    
    overlay_set[i] = overlay;
}

function close_overlay(index) {
    overlay_set[index].setMap(null);
    marker_onoff[index]=0;
}

/* ---------- Marker Cluster용 함수 ---------- */ 




/* ---------- 테스트용 일반 마커 및 Overlay 표시용 함수 (정리 필요) ---------- */ 
var position = new kakao.maps.LatLng(37.2804721840256, 127.11467724252604);

var overlay_marker = new kakao.maps.Marker({
    map: map, 
    position: position
});
var testtitle = "제발이건잘되어야"
var testtext = "테스트 텍스트 테스트 텍스트"
var content = '<div class="overlay_info">';
    content += '    <a href="#"> <strong>'+testtitle+'</strong><div class="close" onclick="closeverlay()" title="닫기"></div></a>';
    content += '    <div class="desc">';
    content += '        <span class="address">'+testtext+'</span>';
    content += '    </div>';
    content += '</div>';


// 마커 위에 커스텀오버레이를 표시합니다
// 마커를 중심으로 커스텀 오버레이를 표시하기위해 CSS를 이용해 위치를 설정했습니다
var test_overlay = new kakao.maps.CustomOverlay({zIndex:1, xAnchor:0.5, yAnchor:1.3});

var marker_click = 0;

// 마커를 클릭했을 때 커스텀 오버레이를 표시합니다
kakao.maps.event.addListener(overlay_marker, 'click', function() {
    if (marker_click == 0){
        test_overlay.setContent(content);
        test_overlay.setPosition(overlay_marker.getPosition());
        test_overlay.setMap(map);
        marker_click = 1;
        } else if (marker_click == 1) {
        closeOverlay()
        }
});

// 커스텀 오버레이를 닫기 위해 호출되는 함수입니다 
function closeOverlay() {
    test_overlay.setMap(null);
    marker_click = 0
}
/* ---------- Overlay 표시용 함수 (정리 필요) ---------- */ 



/*
// 마커를 클릭했을 때 해당 장소의 상세정보를 보여줄 커스텀오버레이입니다
var placeOverlay = new kakao.maps.CustomOverlay({zIndex:1}), 
    contentNode = document.createElement('div'), // 커스텀 오버레이의 컨텐츠 엘리먼트 입니다 
    markers = [], // 마커를 담을 배열입니다
    currCategory = '', // 현재 선택된 카테고리를 가지고 있을 변수입니다
    addressResult = []


// 아무데나 클릭하게되면 overlay를 끄게 합니다.
kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
    placeOverlay.setMap(null)
})

contentNode.className = 'overlay_info'

// 커스텀 오버레이의 컨텐츠 노드에 mousedown, touchstart 이벤트가 발생했을때
// 지도 객체에 이벤트가 전달되지 않도록 이벤트 핸들러로 kakao.maps.event.preventMap 메소드를 등록합니다 
addEventHandle(contentNode, 'mousedown', kakao.maps.event.preventMap)
addEventHandle(contentNode, 'touchstart', kakao.maps.event.preventMap)

// 엘리먼트에 이벤트 핸들러를 등록하는 함수입니다
function addEventHandle(target, type, callback) {
    if (target.addEventListener) {
        target.addEventListener(type, callback);
    } else {
        target.attachEvent('on' + type, callback);
    }
}

// 커스텀 오버레이 컨텐츠를 설정합니다
placeOverlay.setContent(contentNode)



// 지도에 마커를 표출하는 함수입니다
function displayPlaces(places) {
    // 목적지 검색의 경우 최상단 검색결과 좌표로 향하며
    if (currCategory =="keyword"){
        addMarker(new kakao.maps.LatLng(places.y, places.x))
        zoomIn()
        map.panTo(new kakao.maps.LatLng(places.y, places.x))
        displayPlaceInfo(places)
    }
    // 진료소 검색의 경우 모든 좌표를 표시합니다.
    else{
        for (var i=0; i<places.length; i++) {
            // 마커를 생성하고 지도에 표시합니다
            var marker = addMarker(new kakao.maps.LatLng(places[i].y, places[i].x));
            // 마커와 검색결과 항목을 클릭 했을 때 장소정보를 표출하도록 클릭 이벤트를 등록합니다
            (function(marker, place) {
                kakao.maps.event.addListener(marker, 'click', function() {
                    zoomIn()
                    map.panTo(new kakao.maps.LatLng(place.y, place.x))
                    displayPlaceInfo(place)
                })
            })(marker, places[i])
        }
    }
}


// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, palce_type, color) {
    if(currCategory == 'mask'){
        var imageSrc = image_url + color + '/' + palce_type + "-marker.png"
        var imageSize = new kakao.maps.Size(27, 28)  // 마커 이미지의 크기
    } else if(currCategory == 'keyword'){
        var imageSrc = 'static/main/image/keyword.png'
        var imageSize = new kakao.maps.Size(27, 28)
    } else if (currCategory == "hospital"){
        var imageSrc = image_url + 'hospital-marker.png';
        var imageSize = new kakao.maps.Size(27, 28)
    } else {
        var imageSrc = '/static/main/image/patient.png'
        var imageSize = new kakao.maps.Size(27, 28)
    }

    var imgOptions =  {offset: new kakao.maps.Point(10,20)},
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    marker.setMap(map);
    if(currCategory != ''){markers.push(marker);}  // 배열에 생성된 마커를 추가합니다
    return marker;
}

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    if (currCategory != "keyword"){
        for ( var i = 0; i < markers.length; i++ ) {
            markers[i].setMap(null);
        }   
        markers = [];
    }
}

// 클릭한 마커에 대한 장소 상세정보를 커스텀 오버레이로 표시하는 함수입니다
function displayPlaceInfo (place) {
    content = ''
        + '    <div class="placeinfo pb-0">'
        + '        <div class="ptitle d-flex justify-content-between align-items-center flex-wrap">'
        + '            <h1 class="m-0 text-center">' + place.place_name + '</h1>'
        + '        </div>'
        + '        <div class="w-100 p-2">'
        + '            <span class="info_content time_at">전화 번호: <strong>' + place.phone + '</strong></span>'
        + '        </div>'
        + '    </div>'
        + '    <div class="after"></div>'

    contentNode.innerHTML = content;
    placeOverlay.setPosition(new kakao.maps.LatLng(place.y, place.x));
    placeOverlay.setMap(map);
}


// ==================== 확진자 ======================================================

var patientOverlay = new kakao.maps.CustomOverlay({zIndex:1}), 
    patientNode = document.createElement('div'); // 커스텀 오버레이의 컨텐츠 엘리먼트 입니다 

// 커스텀 오버레이의 컨텐츠 노드에 css class를 추가합니다 
patientNode.className = 'placeinfo_wrap';
// 커스텀 오버레이 컨텐츠를 설정합니다
patientOverlay.setContent(patientNode); 

// 커스텀 오버레이의 컨텐츠 노드에 mousedown, touchstart 이벤트가 발생했을때
// 지도 객체에 이벤트가 전달되지 않도록 이벤트 핸들러로 kakao.maps.event.preventMap 메소드를 등록합니다 
addEventHandle(patientNode, 'mousedown', kakao.maps.event.preventMap);
addEventHandle(patientNode, 'touchstart', kakao.maps.event.preventMap);

displayPatient(paths);

// 지도에 확진자 동선을 보여줍니다.
function displayPatient(paths) {
    var length = paths.length;
    for ( var i=0; i<length; i++ ) {
        visited_date_split = paths[i]["visited_date"].split(" ")
        var nodemon = Number(visited_date_split[1].slice(0, -1))
        var nodeday = Number(visited_date_split[2].slice(0, -1))

            // 30일을 기준으로 방문시간이 지날수록 점점 옅게 보여줍니다.
            if ( nodeday+nodemon*30 > dt+mon*30-30){
                // var opa = (((nodeday+nodemon*30)-(dt+mon*30)+30)/30)
                var opa = 1
                var marker = addMarker(new kakao.maps.LatLng(paths[i]["y"], paths[i]["x"]));
                marker.setOpacity(opa);
                (function(marker, y, x, num, date, loc) {
                    kakao.maps.event.addListener(marker, 'click', function() {
                        map.panTo(new kakao.maps.LatLng(y, x))
                        displayPatientInfo(y, x, num,date,loc);
                    });
                })(marker, paths[i]["y"], paths[i]["x"], paths[i]["patient"], paths[i]["visited_date"], paths[i]["place_name"]);
        }
    }
}

// 확진자 정보 커스텀오버레이를 보여줍니다.
function displayPatientInfo (y,x,num,visited_date,place_name) {
    content = ''
        + '    <div class="placeinfo pb-0">'
        + '        <div class="ptitle d-flex justify-content-between align-items-center flex-wrap">'
        //+ '            <h1 class="m-0 text-center"><strong>' + num + '</strong>번 확진자 동선</h1>'
        + '            <h1 class="m-0 text-center"><strong>' + place_name + '</strong></h1>'
        + '        </div>'
        + '        <div class="w-100 p-2">'
        + '            <span class="info_content time_at">다녀간 날짜: <strong>' + visited_date + '</strong></span>'
        // + '            <span class="info_content time_at mt-1">시설 이름: <strong>' + place_name + '</strong></span>'
        + '        </div>'
        + '    </div>'
        + '    <div class="after"></div>'
    contentNode.innerHTML = content;
    placeOverlay.setPosition(new kakao.maps.LatLng(y, x));
    placeOverlay.setMap(map);
}

*/




/*
marker_onoff = Array.from({length: cluster_markers.length}, () => 0);


kakao.maps.event.addListener(cluster_markers, 'click', function() {
    var content = '<div class="overlay_info">';
        content += '    <a href="#"> <strong>'+cluster_markers.getTitle()+'</strong><div class="close" onclick="closeOverlay()" title="닫기"></div></a>';
        content += '    <div class="desc">';
        content += '        <span class="address">내용</span>';
        content += '    </div>';
        content += '</div>';
    
    var overlay = new kakao.maps.CustomOverlay({
        content: content,
        map: map,
        position: cluster_markers.getPosition(),
        xAnchor: 0.5,
        yAnchor: 1.3
    });
    
    marker_onoff[i] = 1
});

//cluster_markers[i]
*/


// 배열 합치기 : a.concat(b)
