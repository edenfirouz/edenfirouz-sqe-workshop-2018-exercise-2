import * as esprima from 'esprima';
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse,{loc:true});
};

let globalDic, assDic, localDic, arguDic, tempDic;
let codeLine;
let subCode;
let inIf, inWhile, inAlternatIf, inFuncDec, inArg, toCalcArrayParam,saved ,inElseIF,test;
let input;
let funcDecCode;


const sySub=(inputCode, code)=>{
    let parsedCode=parseCode(code);
    subCode='';
    toCalcArrayParam=false; inFuncDec=false; inArg=false; saved=false; test=false;
    inIf=0; inWhile=0; inAlternatIf=0;inElseIF=0;
    codeLine=code.split('\n');
    input=inputSplit(inputCode);
    localDic={}; globalDic={}; assDic={}; arguDic={}; tempDic={};
    recCreateDic(parsedCode.body);
    funcDec(funcDecCode);
    return subCode;
};
const inputSplit=(code)=>{
    let ans;
    if (code.includes('[')) {
        let arrArg=code.substring(code.indexOf('['),code.indexOf(']')+1);
        while(arrArg.includes(',')){
            arrArg=arrArg.replace(',','@');
        }
        code=code.substring(0,code.indexOf('['))+arrArg+code.substring(code.indexOf(']')+1,code.length);
    }
    ans=code.split(',');
    for (let i = 0; i < ans.length ; i++) {
        while(ans[i].includes('@'))
            ans[i]=ans[i].replace('@',',');
    }
    return ans;
};
const funcDec=(code)=>{
    subCode+=codeLine[code.loc.start.line-1]+'\n';
    functionDeclaration(code);
    inFuncDec=true;
    recCreateDic(code.body);
    inFuncDec=false;
    subCode+=codeLine[code.loc.end.line-1]+'\n';
};
const recCreateDic=(code)=> {
    if ((code.body != 'undefined') && (code.type=='BlockStatement')) {
        recCreateDic(code.body);
    }
    else{
        for (let i = 0; i < code.length; i++) {
            checkType(code[i]);
        }
    }
};
const checkType=(code)=>{
    if (code.type == 'FunctionDeclaration') {
        funcDecCode=code;
        return;
    }
    else if(code.type=='VariableDeclaration'){
        variableDeclaration(code);
    }
    else
        statementType(code);
};
const saveAssDic=()=>{
    Object.keys(assDic).forEach(function (key) {
        tempDic[key]=assDic[key];
    });
    saved=true;
};

const statementType=(code)=>{
    if(code.type=='ExpressionStatement'){
        expressionStatement(code);
    }
    else if(code.type=='IfStatement'){
        beforeIfStatement();
        ifStatement(code);
    }
    else if(code.type=='ReturnStatement'){
        returnStatement(code);
    }
    else loopStatement(code);
};
const loopStatement=(code)=>{
    if(code.type=='WhileStatement'){
        whileStatement(code);
        assDic={};
        inWhile++;
        recCreateDic(code.body);
        subCode+=codeLine[code.loc.end.line-1]+'\n';
        inWhile--;
    }
    else return;
};
const assignmentExpression=(code)=> {
    let key, value;
    if (code.left.type == 'MemberExpression') {
        key = code.left.object.name + '[' + valueF(code.left.property) + ']';
    }
    else key = code.left.name;
    value = valueF(code.right); //Value
    if (isGlobOrArg(key)){
        if(arguDic[key]==null)
            globalDic[key]=value;
        subCode+=codeLine[code.left.loc.start.line-1].substring(0,code.left.loc.start.column)+key+' = '+value+';\n';
    }
    if (isIn())
        assDic[key]=value;
    else localDic[key]=value;
};

const isGlobOrArg=(key)=>{
    if (arguDic[key]!=null||(globalDic[key]!=null))
        return true;
    else return false;

};

const memberExpression=(code)=>{
    let object =code.object.name;
    let property=valueF(code.property);
    return valueDic(object + '[' + property + ']');
};
const beforeIfStatement=()=>{
    if (! isIn() || inElseIF>0) assDic={};
    else if(!saved) saveAssDic();
    if(inElseIF){
        saved=false;
        tempDic={};
    }
};
const ifStatement=(code)=> {
    test=true;
    let condition= valueF(code.test); //Condition
    test=false;
    color(condition);
    subCode+=codeLine[code.test.loc.start.line-1].substring(0, code.test.loc.start.column)+condition.replace('<',' < ')+codeLine[code.test.loc.start.line-1].substring(code.test.loc.end.column)+'</a><a>\n';
    inIf++;
    recCreateDic(code.consequent);
    subCode+=codeLine[code.consequent.loc.end.line-1]+'\n';
    inIf--;
    inAlternatIf++;
    alternateInIf(code);
    inAlternatIf--;
};
const color=(condition)=>{
    condition=calcArrayParam(condition);
    if(isIn()) {
        Object.keys(assDic).forEach(function (key) {
            while(condition.includes(key))
                condition = condition.replace(key, assDic[key]);
        });
    }
    Object.keys(arguDic).forEach(function(key) {
        while(condition.includes(key))
            condition=condition.replace(key, arguDic[key]);
    });
    if(eval(condition))
        subCode+='</a><a style="background-color:lightgreen;">';
    else subCode+='</a><a style="background-color:indianred;">';
};
const calcArrayParam=(condition)=>{
    if (condition.includes('[')){
        let calc=condition.substring( condition.indexOf('[')+1 ,condition.indexOf(']'));
        //if (eval(calc)){
        toCalcArrayParam=true;
        let key=condition.substring(0,condition.indexOf('[')+1)+eval(calc)+']';
        key=valueDic(key);
        toCalcArrayParam=false;
        return key+condition.substring(condition.indexOf(']')+1,condition.length);
        //}
    }
    else return condition;
};
const valueDic=(key)=> {
    let valueAns = key;
    if (isntArgu(key) && assDic[key] == null)
        valueAns = globalDic[key];
    else if (toCalcArrayParam )
        valueAns = arguDic[key];
    else valueAns=elseValueDic(key);
    return valueAns;
};

const elseValueDic=(key)=>{
    if (assDic[key] != null && isIn()) {
        return forElseValueDic(key);
    }
    else if(tempDic[key]!=null)
        return tempDic[key];
    else if (localDic[key] != null)
        return localDic[key];
    else return key;
};
const forElseValueDic=(key)=>{
    if (arguDic[key] != null && test)
        return key;
    else return assDic[key];
};
const isntArgu=(key)=>{
    if(globalDic[key]!=null && arguDic[key]==null)
        return true;
    else return false;
};
const isIn=()=>{
    if (inWhile>0 || inIf>0){
        return true;
    }
    else return false;
};

const alternateInIf=(code)=>{
    if(code.alternate!=null && code.alternate != 'undefined'){
        inIf++;
        if(!(code.alternate.alternate)) {
            elseStatement(code.alternate);
        }
        inElseIF++;
        enterToArr(code.alternate);
        inElseIF--;
        if (inAlternatIf==1)
            subCode+=codeLine[code.alternate.loc.end.line-1]+'\n';
        inIf--;
        assDic={};
    }
};
const elseStatement=(code)=>{
    subCode+=codeLine[code.loc.start.line-1]+'\n';
    assDic={};
};

const enterToArr=(code)=>{
    if (code.type!= 'BlockStatement'){
        let codeInArr=[];
        codeInArr[0]=code;
        assDic={};
        recCreateDic(codeInArr);
    }
    else
        recCreateDic(code);
};
const whileStatement=(code)=> {
    test=true;
    let condition= valueF(code.test); //Condition
    test=false;
    subCode+=codeLine[code.test.loc.start.line-1].substring(0, code.test.loc.start.column)+condition.replace('<',' < ')+codeLine[code.test.loc.start.line-1].substring(code.test.loc.end.column)+'\n';
};
const expressionStatement=(code)=> {
    assignmentExpression(code.expression);
};
const returnStatement=(code)=>{
    subCode+= codeLine[code.loc.start.line-1].substring(0,code.argument.loc.start.column)+valueF(code.argument)+';\n';
};
const variableDeclaration=(code)=>{
    for (let j = 0; j < code.declarations.length; j++) {
        let key = code.declarations[j].id.name; //key
        if(code.declarations[j].init!=null){
            let value = valueF(code.declarations[j].init)+''; //Value
            if (value.includes('['))
                arrayToDic(key,value);
            else
                notArrayDeclarations(code,key,value,j);
        }
        else{
            nullInit(key);
            if (globalDic[key]!=null) subCode+=codeLine[code.declarations[j].loc.start.line-1].substring(0,code.declarations[j].loc.start.column)+key+';\n';
        }
    }
};
const notArrayDeclarations=(code,key,value,j)=>{
    if(!inFuncDec) {
        globalDic[key] = value;
        subCode+=codeLine[code.declarations[j].loc.start.line-1].substring(0,code.declarations[j].loc.start.column)+key+' = '+value+';\n';
    }
    else localDic[key]=value;
};
const nullInit=(key)=>{
    if(!inFuncDec)
        globalDic[key]=key;
    else localDic[key]=key;
};
const arrayToDic=(key,value)=>{
    value=value.substring(1,value.length-1);
    let values=value.split(',');
    for (let i = 0; i <values.length ; i++) {
        if (inArg)
            arguDic[key+'['+i+']']=values[i].trim();
        if(!inFuncDec)
            globalDic[key+'['+i+']']=values[i].trim();
        else if (isIn())
            assDic[key+'['+i+']']=values[i].trim();
        else localDic[key+'['+i+']']=values[i].trim();
    }
};
const valueF=(code)=>{
    if (code.type=='Identifier'){
        return valueDic(code.name);
    }
    else if(code.type=='Literal'){
        return code.raw;
    }
    else return valueExp(code);
};
const valueExp=(code)=>{
    if(code.type=='UnaryExpression'){
        return code.operator+valueF(code.argument);
    }
    else if(code.type=='ArrayExpression'){
        return arrayExpression(code.elements);
    }
    else if(code.type=='MemberExpression'){
        return memberExpression(code);
    }
    else return binaryExpression(code);
};
const arrayExpression=(code)=>{
    let arr='[';
    for (let i = 0; i < code.length; i++) {
        if(i!=0)
            arr=arr+' , ';
        arr=arr+ valueF(code[i]);
    }
    return arr+']';
};
const binaryExpression=(code)=> {
    let operator= code.operator;
    let left=BExpression(code.left);
    let right=BExpression(code.right);
    if (operator=='*') {
        if (code.left.type != 'Literal')
            left = isBinary(left);
        if (code.right.type != 'Literal')
            right = isBinary(right);
    }
    return left+' '+operator+' '+right;
};

const isBinary=(s)=>{
    s+='';
    let ops=['+','-','/','*','%'];
    for (let i = 0; i < ops.length; i++) {
        if (s.includes(ops[i]) )
            return '(' + s + ')';
    }
    return s;
};
const BExpression=(code)=>{
    if (code.type=='BinaryExpression' ){
        if (code.operator=='+' || code.operator=='-')
            return binaryExpression(code);
        else return '('+binaryExpression(code)+')';
    }
    else if(code.type=='MemberExpression'){
        return memberExpression(code);
    }
    else return valueF(code);
};

const functionDeclaration=(code)=> {
    let key, value;
    if (code.params.length > 0) {
        inArg=true;
        for (let j = 0; j < code.params.length; j++) {
            value='';
            key = code.params[j].name; //Name
            value=input[j];
            if(value.includes('['))
                arrayToDic(key,value);
            else arguDic[key]= value;
        }
        inArg=false;
    }
};

export {sySub};
export {parseCode};
