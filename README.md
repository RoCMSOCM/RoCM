Rotation Curve Modeler (RoCM)
=============

Tool: [Rotation Curve Modeler](http://rotationcurve.herokuapp.com/)

- **[Robert Moss](mailto:mossr@wit.edu)** <sup>(1)</sup>
- **[Alex Clement](mailto:clementa1@wit.edu)** <sup>(1)</sup>

<sup>(1) Wentworth Institute of Technology | Boston, MA</sup>

## Abstract

Astrophysicists will need to model galaxies in programs like MATLAB or Mathematica, but there doesn't exist a singular tool to expedite this process in a universal format. RoCM will help generalize the work being done on galaxy research.  With observable data as the input, any galaxy can be imported into the tool. The data will come from another project, SOCM (Scholarly Observed Celestial Measurements by Patrick McGee and David Miller). RoCM plots the data graph, and includes several curves as overlays. Aiding in finding alternate theories to dark matter, the purpose of RoCM is to expose the intricacies of each theory that solves the rotation curve problem. The scientist or researcher working with this tool will be able to visually see how each parameter in the given model effects the behavior of the rotation curve. Once finished modeling, the user can export the graph in an SVG format. Being a loss-less format makes Scalable Vector Graphics particularly important for data visualization and the figure can be included in scholarly articles.

## Objectives

Originally built by Robert Moss to model the Milky Way galaxy (directed research by Dr. James G. O'Brien), RoCM 2.0 will include several necessary features to generalize the tool (RoCM 1.0 is available in the master branch):

#### Web interface for RoCM and SOCM
- Create a website to host RoCM and SOCM. 
- Seamless UI for scientists to access the data and model the curves within RoCM.
- Host the website on WIT or external servers.

#### Standardize each individual model to be a function v(R)
- Input: R (galactocentric distance in kpc)
- Output: v (rotation velocity in $\frac{km}{s}$)
- Currently 3 models are implemented:
	1.	General relativity model
	2.	Lambda-CDM model (general relativity + cold dark matter)
	3.	Conformal gravity
- Include other alternatives:
	1.	MoND: Modification of Newtonian Dynamics
	2.	TeVeS: Tensor-vector-scalar gravity

#### Allow users to import their own model (via JavaScript code)
- Following the defined v(R) input/output standard.
- Observable galactic parameters from SOCM will be available as constants.
- User defined constants will need to be implemented in the user's function.

#### Import LaTeX equation for each model (optional)
- The user can import their own LaTeX equation to be displayed during the data plotting.
- Aids in understanding the behavior of each parameter.

#### Implement different galactic bulge models
- Current bulge model is for large disk galaxies.
- Bulge models for different classifications of galaxies will be necessary.

#### Interact with RoCS (Rotation Curve Simulation)
- RoCS visualizes the spin of star clusters around the center of a galaxy. 
- Live update the simulation when changing the parameter sliders.
- Include scale and legend for the visualization.

#### Import velocity data and galactic parameters from SOCM.
- Use the repository of observable galactic data to model hundreds/thousands of different galaxies.

#### Dynamic parameter sliders
- For every parameter in the individual models, a dynamic slider with user defined ranges can be created. 
- Enables the user to visualize the behavior of each parameter within the entire model.
- Allows for the testing of uncertainty within the observable data.

#### Settings module for graphing tool
- Edit x,y ranges
- Edit line colors
- Edit graph title

#### Make it open source and widely available.
- Comment code
- Create necessary APIs for RoCM and RoCS
- Redesign code to lower complexity.	

## Note
	
-[Python](http://www.python.org/getit/releases/2.7.5/ "Python") binaries are required.

-Run *server.bat* to set up the localhost server (for data loading from the HTML interfaces)
