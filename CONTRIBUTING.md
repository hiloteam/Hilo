We appreciate you submit code to help perfect Hilo. And there are conventions to obey before you commit changes.

## Develop Pull Request
* Send pull request to the ```dev``` branch
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


## Translation Pull Request
We use ```jsdoc``` to generate api doc, so if code comment is ready, the doc will be ok.

1. Checkout the ```doc-translation``` branch.
2. We support Chinese comment version with ```@language=zh```, you can translate it to English version( ```@language=en```).

  ```
/**
 * @language=en
 * @namespace Hilo的基础核心方法集合。
 * @static
 * @module hilo/core/Hilo
 */
/**
 * @language=zh
 * @namespace Hilo的基础核心方法集合。
 * @static
 * @module hilo/core/Hilo
 */
```

