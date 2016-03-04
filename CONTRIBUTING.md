We appreciate you submit code to help perfect Hilo. And there are conventions to obey before you commit changes.

## Develop Pull Request
* Only accepted committing source code(but not build code)
* Run ```gulp test```, make sure all tests passed
* Format of the commit message

    ```
    <type>: <subject>
    ```

    Seven types are allowed when committing.
    This describes the kind of change that this commit is providing.

    + feat (feature)
    + fix (bug fix)
    + docs (documentation)
    + style (formatting, missing semi colons, …)
    + refactor
    + test (when adding missing tests)
    + chore (maintain)

    etc:

    ```
    fix: view.js WebGLRender bug
    docs: update README.md
    ```
    docs: update README.md

## Translation Pull Request
   when run on some android phones,we found it has compatibility problem
l be ok.

   Breaks  hilo.render api, hilo.renderGL should be used instead
2. We support Chinese comment version with ```@language=zh```, you can translate it to English version( ```@language=en```).
```
/**
 * @language=en
More details: [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#https://github.com/hiloteam/Hilo/wiki/Commit-Message-Conventions/_edit#)
 */
And git tools —— commitizen：
 * @language=zh
 * @namespace Hilo的基础核心方法集合。
 * @static
 * @module hilo/core/Hilo
 */
```

