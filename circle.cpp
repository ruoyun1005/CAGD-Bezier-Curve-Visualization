#include<iostream>
#include <vector>
#include <cmath>
#include <OpenGL/gl3.h> 
#include <OpenGL/glu.h>
#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>


struct v2{
    double x;
    double y;
};

static inline v2 add(v2 a, v2 b){ return {a.x + b.x, a.y + b.y};}
static inline v2 sub(v2 a, v2 b){ return {a.x - b.x, a.y - b.y};}
static inline v2 mul(v2 a, double r){ return {r*a.x, r*a.y};}

float PI = 3.14159265f;


void draw_circle(int n , double R){
    // 這是用很多線段去近似一個圓
    glBegin(GL_POLYGON);

        glNormal3f(0,0,1);
        for (int i = 0; i < n; i++){
            glVertex2f(R * cos( PI/n*i ), R * sin( PI/n*i ));
        }
    glEnd();
}


int init(){
    int n = 1000;
    double R = 0.8f;
    
}

int main(){

glfwInit();
GLFWwindow* window = glfwCreateWindow(800, 600, "Bezier Curve Editor", NULL, NULL);
glfwMakeContextCurrent(window);
    // glfwSetMouseButtonCallback(window, mouse_button_callback);
    // glfwSetCursorPosCallback(window, cursor_position_callback);

    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluOrtho2D(0, 800, 0, 600);

    while (!glfwWindowShouldClose(window)) {
        glClear(GL_COLOR_BUFFER_BIT);
        // drawBezierCurve();
        // drawControlPoints();

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;




}