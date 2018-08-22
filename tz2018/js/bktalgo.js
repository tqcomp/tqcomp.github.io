
function getVoidMatch(actual, capacity){
	var voidWb = [], voidLb = [];

	if (actual >= capacity)
		return [voidWb, voidLb];

	for (var i=0; i < capacity - actual; i++){
		var seed = getSeedPlace(i, capacity);
		voidWb.push(parseInt((seed-1) / 2));
		voidLb.push(parseInt((seed-1) / 4));
	}
	return [voidWb, voidLb];
}

function paddingLBArray(lba){
	var levels = getLBLevel(lba.length-1);	
	
	var rtn = new Array();
	for (var i = 0; i <= levels; i++){
		rtn[i] = new Array();
	}
	
	for (var i = 0; i < lba.length; i++){
		var level = getLBLevel(i);
		//console.log(lba[i]);
		rtn[level].push(lba[i]);
	}
	
	for (var i = 0; i <= levels; i++)
		rtn[i] = rtn[i].reverse();
	
		
	for (var i = 1; i <= levels; i++){
		var n = [];
		var idx = 0;
		var even = (i % 2 == 0);
		for (var j = 0; j < rtn[i-1].length; j++){
			var parent = rtn[i-1][j];
			if (parent[0] == 0 || parent[0] == -1){
				//parent is leaf or invalid
				n[2 * j] = [-1,-1];
				n[2 * j + 1] = [-1,-1];
			}
			else{
				//parent is valide match
				if (even){
					//when even, two valid matches
					n[2 * j] = rtn[i][idx++];
					n[2 * j + 1] = rtn[i][idx++];
				}
				else{
					//when odd, one match and one leaf
					n[2 * j] = rtn[i][idx++];
					n[2 * j + 1] = [0,0];
				}
			}				
		}			
		rtn[i] = n;
	}
	
	//add final level
	rtn[levels + 1] = new Array();
	var n = [];
	for (var j = 0; j < rtn[levels].length; j++){
		var parent = rtn[levels][j];
		if (parent[0] == 0 || parent[0] == -1){
			//parent is leaf or invalid
			n[2 * j] = [-1,-1];
			n[2 * j + 1] = [-1,-1];
		}
		else{
			n[2 * j] = [0,0];
			n[2 * j + 1] = [0,0];
		}
	}
	rtn[levels + 1] = n;
	
	rtn2 = [];
	for (var i = 0; i <=levels + 1; i++){
		for (var j = 0; j < rtn[i].length; j++){
			rtn2.push(rtn[i][j]);
		}
	}
	return rtn2;
}


function fillMatchNoDEWB(parti, mnasec){
	var rt = mnasec.reverse();
	for (var i = parti; i >= 1; i--){
		rt.push([i, 0]);
	}
	return rt;
}

function getSEFinal(count, size, mns){
	var totalRnd = Math.log(size)/Math.log(2);
	var leftRnd = Math.log(count)/Math.log(2);
	
	var k = 0;
	for (let i = 0; i < totalRnd - leftRnd; i++){
		k += size / Math.pow(2, i + 1);
	}
	return mns.slice(k);
}



//in desc order, final comes first
function fillMatchNumbersSE(maxNo){
	var mns = [];
	for (var i = 0; i < maxNo; i++){
		mns.push( [maxNo - i, maxNo - i] );
	}
	
	for (var i = maxNo + 1; i >= 1; i--){
		mns.push( [i, i, 1] );
	}
	return mns
}

function findValidParent(mns, idx, size, level){
	var totallevel = Math.log(size)/Math.log(2);
	if (level > totallevel)
		return -1;
	
	var nextstart = 0;	
	for(let i = 0; i < level + 1; i++){
		nextstart += (size / Math.pow(2, i));
	}
	
	var pidx = nextstart + parseInt(idx / 2);
	if (mns[pidx][1] == 0)
		return findValidParent(mns, pidx, level + 1);
	else
		return pidx;
}


//flag: 1 is se, 2 is se, boolean for consolation
function fillMatchNumberDuel(actual, numParti, flag, consolation){
	if (!isValidSEBracketSize(numParti)){
		console.log(numParti + " is not valid to construct a matches tree");
		return;
	}	
	
	var mns = [], mnd = [];
	var seRndTotal = parseInt(Math.log(numParti)/Math.log(2));
	var voids = getVoidMatch(actual, numParti);
	
	//first round of se
	var v = 1;
	var va = 1;
	
	//wb1,lb1,wb2,lb2,wb3,lb3,lb4,wb4, lb5, lb6......
	for (var i = 0; i < seRndTotal; i++){
		for (var j = 0; j < numParti/Math.pow(2, i + 1); j++){
			mns.push([v++, va++, i+1]);
			if (voids[0].indexOf(mns.length-1) !== -1){
				mns[mns.length-1][1] = 0;
				va--;
			}
		}		
		
		if (flag === 1)
			continue;
		
		if ( i <= 1 ){
			for (var j = 0; j < getLBRndMatchCount(numParti, i + 1); j++){
				mnd.push([v++,va++,i+1]);
				if (voids[1].indexOf(mnd.length-1) !== -1){
					mnd[mnd.length-1][1] = 0;
					va--;
				}				
			}
		}
		else {
			for (var j = 0; j < getLBRndMatchCount( numParti, 2 * (i + 1) - 3 ); j++){					
				mnd.push([v++,va++,2 * (i + 1) - 3]);
				if (voids[1].indexOf(mnd.length-1) !== -1){
					mnd[mnd.length-1][1] = 0;
					va--;
				}				
			}
				
			for (var j = 0; j < getLBRndMatchCount( numParti, 2 * (i + 1) - 2 ); j++){
				mnd.push([v++,va++,2 * (i + 1) - 2]);
				if (voids[1].indexOf(mnd.length-1) !== -1){
					mnd[mnd.length-1][1] = 0;
					va--;
				}				
			}
		}		
	}
	return [mns, mnd];
}

function getLBRndMatchCount(numParti, rnd){
	var p = parseInt((rnd + 1) / 2);
	return numParti / Math.pow(2, p + 1);
}

//get location level in se bracket
function getSELevel(index){
	var idxMax = 0;
	var levelTotal = 0;
	//return 1;
	
	for (var i = 0; ;i++){
		levelTotal = Math.pow(2, i);
		idxMax += levelTotal;
		if (index < idxMax)
			return i;
	}
}

//get location level in loser bracket level
function getLBLevel(index){
	var idxMax = 0;
	var levelTotal = 0;
	
	for (var i = 0; ;i++){
		levelTotal = Math.pow(2, parseInt(i/2));
		idxMax += levelTotal;
		if (index < idxMax)
			return i;
	}		
}

function isValidSEBracketSize(n){
	for (var i = 1; i < 15; i++){
		if (n == Math.pow(2, i)) 
			return true;
	}
	return false;
}

function seedPlayer(seedNo, partSize){
	if (seedNo <= 1)
		return 1;

	if (seedNo % 2 == 0 )
		return parseInt(partSize / 2) + seedPlayer(parseInt(seedNo / 2), parseInt(partSize / 2));
	else
		return seedPlayer(parseInt(seedNo / 2) + 1, parseInt(partSize / 2));
}

'zero based'
function getSeedPlace(seedNo, partSize){
	if (seedNo > partSize)
		return -1;

	if (!isValidSEBracketSize(partSize)){
		return -1;
	}

	var a = [], b = [];
	
	for (var i = 0; i < partSize; i++){
		a[i] = seedPlayer(i+1, partSize);	
	}

	for (var i = 0; i < parseInt(partSize/2); i++)
	{
		b[2*i] = a[i];
		b[2*i+1] = a[partSize-i-1];
	}
	return b[seedNo];
}
