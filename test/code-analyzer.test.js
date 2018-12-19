import assert from 'assert';
import {sySub} from '../src/js/code-analyzer';

describe('The javascript substitution',() => {
    it('is substitute function with complex if-else statement and color the condition', () => {
        assert.equal(
            sySub('1,2,3','function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +'    let b = a + y;\n' +'    let c = 0;\n' +'    \n' +'    if (b < z) {\n' +'        c = c + 5;\n' +'        return x + y + z + c;\n' +'    }\n' +'    else if (b < z * 2) {\n' +'        c = c + x + 5;\n' +'        return x + y + z + c;\n' +'    }\n' +
                '    else {\n' +
                '        c = c + z + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '};'),
            'function foo(x, y, z){\n' +
            '</a><a style="background-color:indianred;">    if (x + 1 + y  <  z) {</a><a>\n' +
            '        return x + y + z + 0 + 5;\n' +
            '    }\n' +
            '</a><a style="background-color:lightgreen;">    else if (x + 1 + y  <  (z * 2)) {</a><a>\n' +
            '        return x + y + z + 0 + x + 5;\n' +
            '    }\n' +
            '    else {\n' +
            '        return x + y + z + 0 + z + 5;\n' +
            '    }\n' +
            '};\n');
    });
    it('is substitute function with while statement', () => {
        assert.equal(
            sySub('1,2,3','function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while(a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n'),
            'function foo(x, y, z){\n' +
            '    while(x + 1  <  z) {\n' +
            '        z = (x + 1 + x + 1 + y) * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}\n');
    });
    it('is substitute function with array declaration in while statement', () => {
        assert.equal(
            sySub('1,2,3','function foo(x, y, z){\n' +
                '\twhile( true ) {\n' +
                '\tlet arr= [1, 5 , true];\n' +
                '\t\tif( arr[0] == 1 ){\n' +
                '\t\t\tarr[1]=arr[1]+1;\n' +
                '\t\t\tif(y>2){\n' +
                '\t\t\t\tx=arr[1];\n' +
                '\t\t\t}\n' +
                '\t\t}\n' +
                '\t\telse{\n' +
                '\t\t\tx=arr[1];\n' +
                '\t\t}\n' +
                '\t\tz = x * 2;\n' +
                '\t} \n' +
                '\treturn z;\n' +
                '};'),
            'function foo(x, y, z){\n' +
            '\twhile( true ) {\n' +
            '</a><a style="background-color:lightgreen;">\t\tif( 1 == 1 ){</a><a>\n' +
            '</a><a style="background-color:indianred;">\t\t\tif(y > 2){</a><a>\n' +
            '\t\t\t\tx = 5 + 1;\n' +
            '\t\t\t}\n' +
            '\t\t}\n' +
            '\t\telse{\n' +
            '\t\t\tx = 5;\n' +
            '\t\t}\n' +
            '\t\tz = x * 2;\n' +
            '\t} \n' +
            '\treturn z;\n' +
            '};\n');
    });
    it('is substitute function with Unary Expression', () => {
        assert.equal(
            sySub('\'hello\', 2,1','function foo(x, y, z){\n' +
                '    while( true) {\n' +
                '        y=1;\n' +
                '        if( x == \'hello\' ){\n' +
                '           y=y+1;\n' +
                '\t\tif(y>2){\n' +
                '\t\t\ty=-1;\n' +
                '\t\t}\n' +
                '        }\n' +
                '        else{\n' +
                '           x=1;\n' +
                '        }\n' +
                '        c = y;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}; \n'),
            'function foo(x, y, z){\n' +
            '    while( true) {\n' +
            '        y = 1;\n' +
            '</a><a style="background-color:lightgreen;">        if( x == \'hello\' ){</a><a>\n' +
            '           y = 1 + 1;\n' +
            '</a><a style="background-color:indianred;">\t\tif(y > 2){</a><a>\n' +
            '\t\t\ty = -1;\n' +
            '\t\t}\n' +
            '        }\n' +
            '        else{\n' +
            '           x = 1;\n' +
            '        }\n' +
            '        z = 1 * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '}; \n');
    });
    it('is substitute function with computation in array place', () => {
        assert.equal(
            sySub('[5, 1 , true]','function foo(a){\n' +
                '   let x=0;\n' +
                '   if (a[x+1]==1){\n' +
                '     a[1]=a[1]+2;\n' +
                '     return a[1]+x;\n' +
                '   }\n' +
                '   if ( a[2] ){\n' +
                '     return true;\n' +
                '   }\n' +
                '};\n'),
            'function foo(a){\n' +
            '</a><a style="background-color:lightgreen;">   if (a[0 + 1] == 1){</a><a>\n' +
            '     a[1] = a[1] + 2;\n' +
            '     return a[1] + 2 + 0;\n' +
            '   }\n' +
            '</a><a style="background-color:lightgreen;">   if ( a[2] ){</a><a>\n' +
            '     return true;\n' +
            '   }\n' +
            '};\n');
    });
    it('is substitute function with computation in array place', () => {
        assert.equal(
            sySub('','let a=[5, 1 , true];\n' +
                'function foo(){\n' +
                '   let x=0;\n' +
                '   if (a[x]==1){\n' +
                '         return a[1]+x;\n' +
                '   }\n' +
                '   if ( a[2] ){\n' +
                '     return true;\n' +
                '   }\n' +
                '};\n'),
            'function foo(){\n' +
            '</a><a style="background-color:indianred;">   if (5 == 1){</a><a>\n' +
            '         return 1 + 0;\n' +
            '   }\n' +
            '</a><a style="background-color:lightgreen;">   if ( true ){</a><a>\n' +
            '     return true;\n' +
            '   }\n' +
            '};\n');
    });
    it('is substitute complex function with if-else', () => {
        assert.equal(
            sySub('1,2,3','function foo(x, y, z){\n' +
                '\tlet a = x + 1;\n' +
                '\tlet b = a + y;\n' +
                '\tlet c = 0;\n' +
                '\tif (b < z) {\n' +
                '\t\tif(b<2){\n' +
                '\t\t\tc = c + 5;\n' +
                '\t\t\treturn x + y + z + c;\n' +
                '\t\t}\n' +
                '\t\telse{\n' +
                '\t\t\treturn c;\n' +
                '\t\t}\n' +
                '\t} \n' +
                '\telse if ( 1 * (z * 2) > b) {\n' +
                '\t\tif(b>x){\n' +
                '\t\t\tc = c + x + 5;\n' +
                '\t\t\treturn x + y + z + c;\n' +
                '\t\t}\n' +
                '\t\telse{\n' +
                '\t\t\treturn x;\n' +
                '\t\t}\n' +
                '\t}\n' +
                '\telse {\n' +
                '\t\tc = c + z + 5;\n' +
                '\t\treturn x + y + z + c;\n' +
                '\t}\n' +
                '};\n'),
            'function foo(x, y, z){\n' +
            '</a><a style="background-color:indianred;">\tif (x + 1 + y  <  z) {</a><a>\n' +
            '</a><a style="background-color:indianred;">\t\tif(x + 1 + y  <  2){</a><a>\n' +
            '\t\t\treturn x + y + z + 0 + 5;\n' +
            '\t\t}\n' +
            '\t\telse{\n' +
            '\t\t\treturn 0;\n' +
            '\t\t}\n' +
            '\t} \n' +
            '</a><a style="background-color:lightgreen;">\telse if ( (1 * ((z * 2))) > x + 1 + y) {</a><a>\n' +
            '</a><a style="background-color:lightgreen;">\t\tif(x + 1 + y > x){</a><a>\n' +
            '\t\t\treturn x + y + z + 0 + x + 5;\n' +
            '\t\t}\n' +
            '\t\telse{\n' +
            '\t\t\treturn x;\n' +
            '\t}\n' +
            '\telse {\n' +
            '\t\treturn x + y + z + 0 + z + 5;\n' +
            '\t}\n' +
            '};\n');
    });
    it('is substitute function with while statement and global', () => {
        assert.equal(
            sySub('1,2,3','let TOTAL;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    TOTAL=3;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        c = c + TOTAL;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '    else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '    else {\n' +
                '        TOTAL=6;\n' +
                '        c = c + z + 5+TOTAL;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '};\n'),
            'let TOTAL;\n' +
            'function foo(x, y, z){\n' +
            '    TOTAL = 3;\n' +
            '</a><a style="background-color:indianred;">    if (x + 1 + y  <  z) {</a><a>\n' +
            '        return x + y + z + 0 + 5 + 3;\n' +
            '    } \n' +
            '</a><a style="background-color:lightgreen;">    else if (x + 1 + y  <  (z * 2)) {</a><a>\n' +
            '        return x + y + z + 0 + x + 5;\n' +
            '    }\n' +
            '    else {\n' +
            '        TOTAL = 6;\n' +
            '        return x + y + z + 0 + z + 5 + 6;\n' +
            '    }\n' +
            '};\n');
    });
    it('is substitute function with initial global argument', () => {
        assert.equal(
            sySub('1,1,1','let TOTAL=1;\n' +
                'function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    TOTAL=3;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '        c = c + TOTAL;\n' +
                '        return x + y + z + c;\n' +
                '    } \n' +
                '    else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '    else {\n' +
                '        TOTAL=6;\n' +
                '        c = c + z + 5+TOTAL;\n' +
                '        return x + y + z + c;\n' +
                '    }\n' +
                '};\n' +
                'TOTAL=TOTAL+1;\n'),
            'let TOTAL = 1;\n' +
            'TOTAL = 1 + 1;\n' +
            'function foo(x, y, z){\n' +
            '    TOTAL = 3;\n' +
            '</a><a style="background-color:indianred;">    if (x + 1 + y  <  z) {</a><a>\n' +
            '        return x + y + z + 0 + 5 + 3;\n' +
            '    } \n' +
            '</a><a style="background-color:indianred;">    else if (x + 1 + y  <  (z * 2)) {</a><a>\n' +
            '        return x + y + z + 0 + x + 5;\n' +
            '    }\n' +
            '    else {\n' +
            '        TOTAL = 6;\n' +
            '        return x + y + z + 0 + z + 5 + 6;\n' +
            '    }\n' +
            '};\n');
    });
    it('is substitute function with array input argument', () => {
        assert.equal(
            sySub('\'hello\',1,1,[\'hello\', 5 , true]',
                'function foo(x, y, z, arr){\n' +
                'let c;\n' +
                '    while( arr[2] ) {\n' +
                '        if( arr[0] == \'hello\' ){\n' +
                '           y=arr[1]+1;\n' +
                '\t\tif(y>2){\n' +
                '\t\t\tx=3;\n' +
                '\t\t}\n' +
                '        }\n' +
                '        else{\n' +
                '           x=x+\' bye\';\n' +
                '        }\n' +
                '        c = arr[1];\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '};'),
            'function foo(x, y, z, arr){\n' +
            '    while( arr[2] ) {\n' +
            '</a><a style="background-color:lightgreen;">        if( arr[0] == \'hello\' ){</a><a>\n' +
            '           y = arr[1] + 1;\n' +
            '</a><a style="background-color:lightgreen;">\t\tif(y > 2){</a><a>\n' +
            '\t\t\tx = 3;\n' +
            '\t\t}\n' +
            '        }\n' +
            '        else{\n' +
            '           x = x + \' bye\';\n' +
            '        }\n' +
            '        z = arr[1] * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '};\n');
    });

    it('is substitute function with local array expression', () => {
        assert.equal(
            sySub('\'hello\',1,1','function foo(x, y, z){\n' +
                'let arr=[\'hello\', 5 , true];\n' +
                'let c=arr[1];\n' +
                '    while( arr[2] ) {\n' +
                '        if( arr[0] == \'hello\' ){\n' +
                '           y=arr[1]+1;\n' +
                '\t\tif(y>2){\n' +
                '\t\t\tx=3;\n' +
                '\t\t}\n' +
                '        }\n' +
                '        else{\n' +
                '           x=x+\' bye\';\n' +
                '        }\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '};\n'),
            'function foo(x, y, z){\n' +
            '    while( true ) {\n' +
            '</a><a style="background-color:lightgreen;">        if( \'hello\' == \'hello\' ){</a><a>\n' +
            '           y = 5 + 1;\n' +
            '</a><a style="background-color:lightgreen;">\t\tif(y > 2){</a><a>\n' +
            '\t\t\tx = 3;\n' +
            '\t\t}\n' +
            '        }\n' +
            '        else{\n' +
            '           x = x + \' bye\';\n' +
            '        }\n' +
            '        z = 5 * 2;\n' +
            '    }\n' +
            '    return z;\n' +
            '};\n');
    });
});