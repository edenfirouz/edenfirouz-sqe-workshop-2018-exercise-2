import $ from 'jquery';
import {sySub} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let inputCode = $('#inputToCode').val();
        let sub= sySub(inputCode,codeToParse);
        document.getElementById('parsedCode').innerHTML=sub;
    });
});
