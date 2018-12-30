var h = window.innerHeight - 30;
var w = window.innerWidth - 60;

var expandeds = []

function enlighen(id)
{
	jsPlumb.select({source:id}).setHover(true);
}

function endarken(id)
{
	jsPlumb.select({source:id}).setHover(false);
}

function delete_children(id)
{
	jsPlumb.select({source:id}).each(function(connection) {
		var child = connection.target;
		var indegree = 0;
		jsPlumb.detach(connection);
		jsPlumb.select({target:child}).each(function(connection) { indegree += 1; });
		if(indegree == 0)
		{
			delete_children(child);
			jsPlumb.remove(child);
		}
	});
}

function fillTheTree(str, word, x, y, parent, green)
{
	var index = expandeds.indexOf(word);
	if(index != -1)
	{
		//jsPlumb.detachAllConnections(parent);
		expandeds.splice(index, 1);
		
		//jsPlumb.select({source:parent}).detach();
		delete_children(parent);
		
		return;
	}
	
	var list = str.substring(0, str.length-4).split("<br>");
	
	// finding radius
	var r = Math.min(h - y, Math.min(w - x, y));
	
	var newWords = [];
	for(i=0; i<list.length; i++)
	{
		if(expandeds.indexOf(list[i]) == -1)
		{
			newWords.push(list[i]);
			expandeds.push(list[i]);
		}
	}
	
	if(expandeds.indexOf(word) == -1)
	{
		for(i=0; i<newWords.length; i++)
		{
			var offset = 5;
			var divTop = y + r * Math.cos(Math.PI * (i + offset) / (newWords.length + 2 * offset));
			var divRight = x + r * Math.sin(Math.PI * (i + offset) / (newWords.length + 2 * offset));
			
			var id_word = newWords[i].split(',');
			var id = id_word[0];
			var words = id_word[1];
			
			// creat the word in space
			var div = document.createElement('div');
			div.className = "word";
			div.id = newWords[i].split(',')[0];
			div.style.top = divTop + "px";
			div.style.right = divRight + "px";
			//div.onmouseover = function(){enlighen(div.id);};
			//div.onmouseout = function(){endarken(div.id)};
			div.innerHTML = '<a onmouseover="enlighen(\'' + id + '\')" onmouseout="endarken(\'' + id + '\')" onclick="fillWithWord(this.innerHTML, ' + divRight + ', ' + divTop + ', \'' + id + '\')" onContextMenu="fillWithWordGreen(this.innerHTML, ' + divRight + ', ' + divTop + ', \'' + id + '\')">' + words + "</a>";
			document.getElementsByTagName('body')[0].appendChild(div);
			
			expandeds.push(newWords[i]);
			
			// draggable
			jsPlumb.draggable(newWords[i].split(',')[0]);
		}
	}
		
	expandeds.push(word);
	
	var color;
	if(parent.substring(0, 3) == 'syn' && !green)
		color = 'blue';
	else
		color = 'green';
	
	var lineLable = (color=='green'? "شبیه": "فرزند");
	
	for(i=0; i<list.length; i++)
	{
		// connect them to parent
		jsPlumb.ready(function() {
            var connection = jsPlumb.connect({
                source:parent,
                target:list[i].split(',')[0],
                endpoint:[ "Rectangle", { width:2, height:2 } ],
				anchors:["Left", "Right"],
				overlays:["Arrow", [ "Label", { label:lineLable, location:0.75, id:"myLabel" } ]],
				hoverPaintStyle: { lineWidth:3, strokeStyle: "red" },
				paintStyle:{lineWidth:1, strokeStyle:color}
            });
        });
	}
}

function fillWithURL(url, word, x, y, id, green)
{
	$.ajax({
		url: url,
		type: 'GET',
		success: function(responce){
			fillTheTree(responce, word, x, y, id, green);
		},
		error: function(xhr, textStatus, errorThrown){
			alert('request failed\nxhr: ' + xhr.status + '\ntext status: ' + textStatus + '\nerror: ' + errorThrown);
		}
    });
}

function fillWithWord(word, x, y, id)
{	
	if(id == "null" && x == -1 && y == -1)
	{
		x = 0;
		y = h/2;
		
		var div = document.createElement('div');
		div.className = "word";
		div.id = word;
		div.style.top = y + "px";
		div.style.right = x + "px";
		div.innerHTML = word;
		document.getElementsByTagName('body')[0].appendChild(div);
		
		id = word;
		
		fillWithURL("tree.php?word=" + word, word, x, y, id, false);
	}
	else
	{
		fillWithURL("tree.php?word=" + id, word, x, y, id, false);
	}
	
}

function fillWithWordGreen(word, x, y, id)
{
	fillWithURL("tree.php?green=1&word=" + word.substring(1, word.length-2), word, x, y, id, true);
}