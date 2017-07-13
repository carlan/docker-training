Goto Plugin
===========

The goto plugin is a pre-stepleave plugin. It is executed before 
`impress:stepleave` event, and will alter the destination where to transition next.

Example:

        <!-- When leaving this step, go directly to "step-5" -->
        <div class="step" data-goto="step-5">

        <!-- When leaving this step with next(), go directly to "step-5", instead of the next step.
             If moving backwards to previous step - e.g. prev() instead of next() - then go to "step-1". -->
        <div class="step" data-goto-next="step-5" data-goto-prev="step-1">

Author
------

Copyright 2016 Henrik Ingo (@henrikingo)
Released under the MIT license.

